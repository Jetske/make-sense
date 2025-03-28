import React, { useState } from 'react';
import './InsertLabelNamesPopup.scss';
import { GenericYesNoPopup } from '../GenericYesNoPopup/GenericYesNoPopup';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { updateLabelNames } from '../../../store/labels/actionCreators';
import { updateActivePopupType, updatePerClassColorationStatus } from '../../../store/general/actionCreators';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars-2';
import { ImageButton } from '../../Common/ImageButton/ImageButton';
import { LabelName } from '../../../store/labels/types';
import { LabelUtil } from '../../../utils/LabelUtil';
import { LabelsSelector } from '../../../store/selectors/LabelsSelector';
import { LabelActions } from '../../../logic/actions/LabelActions';
import { ColorSelectorView } from './ColorSelectorView/ColorSelectorView';
import { Settings } from '../../../settings/Settings';
import { reject, sample, filter, uniq } from 'lodash';
import { ProjectType } from '../../../data/enums/ProjectType';
import { submitNewNotification } from '../../../store/notifications/actionCreators';
import { INotification } from '../../../store/notifications/types';
import { NotificationUtil } from '../../../utils/NotificationUtil';
import { NotificationsDataMap } from '../../../data/info/NotificationsData';
import { Notification } from '../../../data/enums/Notification';
import { StyledTextField } from '../../Common/StyledTextField/StyledTextField';

interface IProps {
    updateActivePopupTypeAction: (activePopupType: PopupWindowType) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    updatePerClassColorationStatusAction: (updatePerClassColoration: boolean) => any;
    submitNewNotificationAction: (notification: INotification) => any;
    isUpdate: boolean;
    projectType: ProjectType;
    enablePerClassColoration: boolean;
}

const InsertLabelNamesPopup: React.FC<IProps> = (
    {
        updateActivePopupTypeAction,
        updateLabelNamesAction,
        updatePerClassColorationStatusAction,
        submitNewNotificationAction,
        isUpdate,
        projectType,
        enablePerClassColoration
    }) => {
    const [labelNames, setLabelNames] = useState(LabelsSelector.getLabelNames());

    const validateEmptyLabelNames = (): boolean => {
        const emptyLabelNames = filter(labelNames, (labelName: LabelName) => labelName.name === '');
        return emptyLabelNames.length === 0;
    };

    const validateNonUniqueLabelNames = (): boolean => {
        const uniqueLabelNames = uniq(labelNames.map((labelName: LabelName) => labelName.name));
        return uniqueLabelNames.length === labelNames.length;
    };

    const callbackWithLabelNamesValidation = (callback: () => any): () => any => {
        return () => {
            if (!validateEmptyLabelNames()) {
                submitNewNotificationAction(NotificationUtil
                    .createErrorNotification(NotificationsDataMap[Notification.EMPTY_LABEL_NAME_ERROR]));
                return;
            }
            if (validateNonUniqueLabelNames()) {
                callback();
            } else {
                submitNewNotificationAction(NotificationUtil
                    .createErrorNotification(NotificationsDataMap[Notification.NON_UNIQUE_LABEL_NAMES_ERROR]));
            }
        };
    };


    const hslToHex = (h: number, s: number, l: number): string => {
        s /= 100;
        l /= 100;
    
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const a = s * Math.min(l, 1 - l);
            return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
        };
    
        return `#${f(0).toString(16).padStart(2, "0")}${f(8).toString(16).padStart(2, "0")}${f(4).toString(16).padStart(2, "0")}`;
    };

    const generateDistinctColors = (count: number): string[] => {
        return Array.from({ length: count }, (_, i) => {
            const hue = (i * 360) / count; // Evenly spread hues
            return hslToHex(hue, 80, 50); // Convert HSL to Hex
        });
    };
    
    const assignDistinctColors = () => {
        const colors = generateDistinctColors(labelNames.length); // Generate evenly spaced colors
        const newLabelNames = labelNames.map((labelName, index) => ({
            ...labelName,
            color: colors[index]
        }));
    
        setLabelNames(newLabelNames);
    };


    const addLabelNameCallback = () => {
        const colors = generateDistinctColors(labelNames.length+1); // Generate evenly spaced colors
        let newLabelNames = [
            ...labelNames,
            LabelUtil.createLabelName('')
        ];
        newLabelNames = newLabelNames.map((labelName, index) => ({
            ...labelName,
            color: colors[index]
        }));
        
        setLabelNames(newLabelNames);
    };

    const safeAddLabelNameCallback = () => callbackWithLabelNamesValidation(addLabelNameCallback)();

    const deleteLabelNameCallback = (id: string) => {
        const colors = generateDistinctColors(labelNames.length-1); // Generate evenly spaced colors
        let newLabelNames = reject(labelNames, { id });
        newLabelNames = newLabelNames.map((labelName, index) => ({
            ...labelName,
            color: colors[index]
        }));

        setLabelNames(newLabelNames);
    };

    const togglePerClassColorationCallback = () => {
        updatePerClassColorationStatusAction(!enablePerClassColoration);
    };

    const changeLabelNameColorCallback = (id: string) => {
        const newLabelNames = labelNames.map((labelName: LabelName) => {
            return labelName.id === id ? { ...labelName, color: sample(Settings.LABEL_COLORS_PALETTE) } : labelName;
        });
        setLabelNames(newLabelNames);
    };

    const onKeyUpCallback = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            safeAddLabelNameCallback();
        }
    };

    const onChange = (id: string, value: string) => {
        let newLabelNames = labelNames.map((labelName: LabelName) => {
            return labelName.id === id ? {
                ...labelName, name: value
            } : labelName;
        });
        const colors = generateDistinctColors(labelNames.length); // Generate evenly spaced colors
        newLabelNames = newLabelNames.map((labelName, index) => ({
            ...labelName,
            color: colors[index]
        }));
        setLabelNames(newLabelNames);
    };

    const labelInputs = labelNames.map((labelName: LabelName) => {
        const onChangeCallback = (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(labelName.id, event.target.value);
        const onDeleteCallback = () => deleteLabelNameCallback(labelName.id);
        const onChangeColorCallback = () => assignDistinctColors();
        return <div className='LabelEntry' key={labelName.id}>
            <StyledTextField variant='standard'
                id={'key'}
                autoComplete={'off'}
                autoFocus={true}
                type={'text'}
                margin={'dense'}
                label={'Insert label'}
                onKeyUp={onKeyUpCallback}
                value={labelName.name}
                onChange={onChangeCallback}
                style={{ width: 280 }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            {projectType === ProjectType.OBJECT_DETECTION && enablePerClassColoration && <ColorSelectorView
                color={labelName.color}
                onClick={onChangeColorCallback}
            />}
            <ImageButton
                image={'ico/trash.png'}
                imageAlt={'remove_label'}
                buttonSize={{ width: 30, height: 30 }}
                onClick={onDeleteCallback}
            />
        </div>;
    });


    const onCreateAcceptCallback = () => {
        const nonEmptyLabelNames: LabelName[] = reject(labelNames,
            (labelName: LabelName) => labelName.name.length === 0);
        const colors = generateDistinctColors(nonEmptyLabelNames.length); // Generate evenly spaced colors
        const newLabelNames = nonEmptyLabelNames.map((labelName, index) => ({
            ...labelName,
            color: colors[index]
        }));
        if (labelNames.length > 0) {
            updateLabelNamesAction(newLabelNames);
        }
        updateActivePopupTypeAction(null);
    };

    const safeOnCreateAcceptCallback = () => callbackWithLabelNamesValidation(onCreateAcceptCallback)();

    const onUpdateAcceptCallback = () => {
        const nonEmptyLabelNames: LabelName[] = reject(labelNames,
            (labelName: LabelName) => labelName.name.length === 0);
        const missingIds: string[] = LabelUtil.labelNamesIdsDiff(LabelsSelector.getLabelNames(), nonEmptyLabelNames);
        LabelActions.removeLabelNames(missingIds);
        const colors = generateDistinctColors(nonEmptyLabelNames.length); // Generate evenly spaced colors
        const newLabelNames = nonEmptyLabelNames.map((labelName, index) => ({
            ...labelName,
            color: colors[index]
        }));
        updateLabelNamesAction(newLabelNames);
        updateActivePopupTypeAction(null);
    };

    const safeOnUpdateAcceptCallback = () => callbackWithLabelNamesValidation(onUpdateAcceptCallback)();

    const onCreateRejectCallback = () => {
        updateActivePopupTypeAction(PopupWindowType.LOAD_LABEL_NAMES);
    };

    const onUpdateRejectCallback = () => {
        updateActivePopupTypeAction(null);
    };

    const renderContent = () => {
        return (<div className='InsertLabelNamesPopup'>
            <div className='LeftContainer'>
                <ImageButton
                    image={'ico/plus.png'}
                    imageAlt={'plus'}
                    buttonSize={{ width: 40, height: 40 }}
                    padding={25}
                    onClick={safeAddLabelNameCallback}
                    externalClassName={'monochrome'}
                />
                {labelNames.length > 0 && <ImageButton
                    image={enablePerClassColoration ? 'ico/colors-on.png' : 'ico/colors-off.png'}
                    imageAlt={'per-class-coloration'}
                    buttonSize={{ width: 40, height: 40 }}
                    padding={15}
                    onClick={togglePerClassColorationCallback}
                    isActive={enablePerClassColoration}
                    externalClassName={enablePerClassColoration ? '' : 'monochrome'}
                />}
            </div>
            <div className='RightContainer'>
                <div className='Message'>
                    {
                        isUpdate ?
                            'You can now edit the label names you use to describe the objects in the photos. Use the ' +
                            '+ button to add a new empty text field.' :
                            'Before you start, you can create a list of labels you plan to assign to objects in your ' +
                            'project. You can also choose to skip that part for now and define label names as you go.'
                    }
                </div>
                <div className='LabelsContainer'>
                    {Object.keys(labelNames).length !== 0 ? <Scrollbars>
                        <div
                            className='InsertLabelNamesPopupContent'
                        >
                            {labelInputs}
                        </div>
                    </Scrollbars> :
                        <div
                            className='EmptyList'
                            onClick={addLabelNameCallback}
                        >
                            <img
                                draggable={false}
                                alt={'upload'}
                                src={'ico/type-writer.png'}
                            />
                            <p className='extraBold'>Your label list is empty</p>
                        </div>}
                </div>
            </div>
        </div>);
    };

    return (
        <GenericYesNoPopup
            title={isUpdate ? 'Edit labels' : 'Create labels'}
            renderContent={renderContent}
            acceptLabel={isUpdate ? 'Accept' : 'Start project'}
            onAccept={isUpdate ? safeOnUpdateAcceptCallback : safeOnCreateAcceptCallback}
            rejectLabel={isUpdate ? 'Cancel' : 'Load labels from file'}
            onReject={isUpdate ? onUpdateRejectCallback : onCreateRejectCallback}
        />);
};

const mapDispatchToProps = {
    updateActivePopupTypeAction: updateActivePopupType,
    updateLabelNamesAction: updateLabelNames,
    updatePerClassColorationStatusAction: updatePerClassColorationStatus,
    submitNewNotificationAction: submitNewNotification
};

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type,
    enablePerClassColoration: state.general.enablePerClassColoration
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InsertLabelNamesPopup);
