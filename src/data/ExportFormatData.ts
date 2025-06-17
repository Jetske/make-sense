import {ILabelFormatData} from '../interfaces/ILabelFormatData';
import {LabelType} from './enums/LabelType';
import {AnnotationFormatType} from './enums/AnnotationFormatType';

export type ExportFormatDataMap = Record<LabelType, ILabelFormatData[]>;

export const ExportFormatData: ExportFormatDataMap = {
    [LabelType.RECT]: [
        {
            type: AnnotationFormatType.YOLO,
            label: 'A .zip package containing files in YOLO format.'
        }
    ],
    [LabelType.POINT]: [
        {
            type: AnnotationFormatType.CSV,
            label: 'Single CSV file.'
        }
    ],
    [LabelType.LINE]: [
        {
            type: AnnotationFormatType.CSV,
            label: 'Single CSV file.'
        }
    ],
    [LabelType.POLYGON]: [
        {
            type: AnnotationFormatType.YOLO,
            label: 'A .zip package containing files in YOLO format.'
        }
    ],
    [LabelType.IMAGE_RECOGNITION]: [
        {
            type: AnnotationFormatType.CSV,
            label: 'Single CSV file.'
        },
        {
            type: AnnotationFormatType.JSON,
            label: 'Single JSON file.'
        }
    ]
}
