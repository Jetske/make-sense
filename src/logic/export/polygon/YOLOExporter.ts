import {ImageData, LabelName, LabelPolygon} from '../../../store/labels/types';
import {ImageRepository} from '../../imageRepository/ImageRepository';
import {IPoint} from '../../../interfaces/IPoint';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import {ExporterUtil} from '../../../utils/ExporterUtil';
import {findIndex, findLast} from 'lodash';
import {ISize} from '../../../interfaces/ISize';
import {NumberUtil} from '../../../utils/NumberUtil';

export class YOLOExporter {

    public static export(): void {
        const zip = new JSZip();
        LabelsSelector.getImagesData()
            .forEach((imageData: ImageData) => {
                const fileContent: string = YOLOExporter.wrapPolygonLabelsIntoYOLO(imageData);
                if (fileContent) {
                    const fileName : string = imageData.fileData.name.replace(/\.[^/.]+$/, '.txt');
                    try {
                        zip.file(fileName, fileContent);
                    } catch (error) {
                        // TODO
                        throw new Error(error as string);
                    }
                }
            });

        try {
            zip.generateAsync({type:'blob'})
                .then((content: Blob) => {
                    saveAs(content, `${ExporterUtil.getExportFileName()}.zip`);
                });
        } catch (error) {
            // TODO
            throw new Error(error as string);
        }
    }

    public static wrapPolygonLabelIntoYOLO(
        labelPolygon: LabelPolygon,
        labelNames: LabelName[],
        imageSize: ISize
    ): string {
        const snapAndFix = (value: number) =>
            NumberUtil.snapValueToRange(value, 0, 1).toFixed(6);

        const classIdx: string = findIndex(labelNames, { id: labelPolygon.labelId }).toString();

        const normalizedPoints: string[] = labelPolygon.vertices.flatMap((vertex: IPoint) => {
            const x = parseFloat(snapAndFix(vertex.x / imageSize.width));
            const y = parseFloat(snapAndFix(vertex.y / imageSize.height));
            return [x.toFixed(6), y.toFixed(6)];
        });

        return [classIdx, ...normalizedPoints].join(' ');
    }

    private static wrapPolygonLabelsIntoYOLO(imageData: ImageData): string {
        if (imageData.labelPolygons.length === 0 || !imageData.loadStatus)
            return null;

        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        const imageSize: ISize = { width: image.width, height: image.height };

        const labelPolygonsString: string[] = imageData.labelPolygons
            .filter((labelPolygon: LabelPolygon) => labelPolygon.labelId !== null)
            .map((labelPolygon: LabelPolygon) => {
                return YOLOExporter.wrapPolygonLabelIntoYOLO(labelPolygon, labelNames, imageSize);
            });

        return labelPolygonsString.join('\n');
    }

}