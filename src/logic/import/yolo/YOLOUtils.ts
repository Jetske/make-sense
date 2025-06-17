import {LabelName, LabelRect, LabelPolygon} from '../../../store/labels/types';
import {LabelUtil} from '../../../utils/LabelUtil';
import {AnnotationsParsingError, LabelNamesNotUniqueError} from './YOLOErrors';
import {ISize} from '../../../interfaces/ISize';
import {uniq} from 'lodash';
import {LabelType} from '../../../data/enums/LabelType';
import {store} from '../../../index';
import {updateActiveLabelType} from '../../../store/labels/actionCreators';

export class YOLOUtils {
    public static parseLabelsNamesFromString(content: string): LabelName[] {
        const labelNames: string[] = content
            .split(/[\r\n]/)
            .filter(Boolean)
            .map((name: string) => name.replace(/\s/g, ''))

        if (uniq(labelNames).length !== labelNames.length) {
            throw new LabelNamesNotUniqueError()
        }

        return labelNames
            .map((name: string) => LabelUtil.createLabelName(name))
    }

    public static loadLabelsList(
        fileData: File,
        onSuccess: (labels: LabelName[]) => void,
        onFailure: (error: Error) => void
    ) {
        const reader = new FileReader();
        reader.onloadend = (evt: ProgressEvent<FileReader>) => {
            try {
                const content: string = evt.target.result as string;
                const labelNames = YOLOUtils.parseLabelsNamesFromString(content);
                onSuccess(labelNames);
            } catch (error) {
                onFailure(error as Error)
            }
        };
        reader.readAsText(fileData);
    }

    public static parseYOLOAnnotationsFromString(
        rawAnnotations: string,
        labelNames: LabelName[],
        imageSize: ISize,
        imageName: string
    ): { rects: LabelRect[], polygons: LabelPolygon[] } {
        const rects: LabelRect[] = [];
        const polygons: LabelPolygon[] = [];
        rawAnnotations.split(/[\r\n]/)
            .filter(Boolean)
            .forEach((rawAnnotation: string) => {
                const annotation = YOLOUtils.parseYOLOAnnotationFromString(
                    rawAnnotation, labelNames, imageSize, imageName
                );
                if ('rect' in annotation){
                    rects.push(annotation as LabelRect);
                    store.dispatch(updateActiveLabelType(LabelType.RECT))
                } else {
                    polygons.push(annotation as LabelPolygon);
                    store.dispatch(updateActiveLabelType(LabelType.POLYGON))
                }
            });
        return { rects, polygons };
    }

    public static parseYOLOAnnotationFromString(
        rawAnnotation: string,
        labelNames: LabelName[],
        imageSize: ISize,
        imageName: string
    ): LabelRect | LabelPolygon{
        const components = rawAnnotation.split(' ');
        if (!YOLOUtils.validateYOLOAnnotationComponents(components, labelNames.length)) {
            throw new AnnotationsParsingError(imageName);
        }
        const labelIndex: number = parseInt(components[0]);
        const labelId: string = labelNames[labelIndex].id;
        const coords = components.slice(1).map(Number);

        if (coords.length === 4 && coords.every(v => !isNaN(v) && v >= 0.0 && v <= 1.0)) {
            // Rect (standard YOLO format)
            const [rectX, rectY, rectWidth, rectHeight] = coords;
            const rect = {
                x: (rectX - rectWidth / 2) * imageSize.width,
                y: (rectY - rectHeight / 2) * imageSize.height,
                width: rectWidth * imageSize.width,
                height: rectHeight * imageSize.height
            };
            return LabelUtil.createLabelRect(labelId, rect);
        } else if (coords.length >= 6 && coords.length % 2 === 0 && coords.every(v => !isNaN(v) && v >= 0.0 && v <= 1.0)) {
            // Polygon
            const points = [];
            for (let i = 0; i < coords.length; i += 2) {
                points.push({
                    x: coords[i] * imageSize.width,
                    y: coords[i + 1] * imageSize.height
                });
            }
            return LabelUtil.createLabelPolygon(labelId, points);
        }
    }

    public static validateYOLOAnnotationComponents(components: string[], labelNamesCount: number): boolean {
        const validateCoordinateValue = (rawValue: string): boolean => {
            const floatValue: number = Number(rawValue);
            return !isNaN(floatValue) && floatValue >= 0.0 && floatValue <= 1.0;
        };

        const validateLabelIdx = (rawValue: string): boolean => {
            const intValue: number = parseInt(rawValue);
            return !isNaN(intValue) && intValue >= 0 && intValue < labelNamesCount;
        };

        // Must have an odd number of components: label index + pairs of coordinates
        if (components.length < 5 || (components.length - 1) % 2 !== 0) {
            return false;
        }

        const isLabelValid = validateLabelIdx(components[0]);
        const areCoordsValid = components.slice(1).every(validateCoordinateValue);

        return isLabelValid && areCoordsValid;
    }
}
