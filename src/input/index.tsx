import * as React from 'react';
import styles from './input.scss';
import PatchEvent, { setIfMissing, unset, set } from '@sanity/form-builder/lib/PatchEvent';
import Field from '@sanity/form-builder/lib/inputs/ObjectInput/Field';
import { IType } from '../types/IType';

interface IField {
    name: string;
    type: IType;
}

interface IProps {
    type: IType;
    isRoot?: boolean
    value?: {[key: string]: any};
    markers?: any[];
    readOnly?: boolean;
    focusPath?: any[];
    onChange?: (...args: any[]) => any;
    onFocus: (...args: any[]) => any;
    onBlur: (...args: any[]) => any;
    filterField?: (...args: any[]) => any;
}

interface IState {
    currentLanguage: string;
}

class Input extends React.PureComponent<IProps, IState> {
    public state: IState = {
        currentLanguage: '',
    }

    /**
     * Taken from ObjectInput in native sanity library
     */
    public handleFieldChange = (fieldEvent: PatchEvent, field: IField) => {
        const { currentLanguage } = this.state;
        const { type, value, isRoot, onChange } = this.props;
        const { fields } = type;
        let event = fieldEvent
            .prefixAll(field.name)
            .prefixAll(currentLanguage);
        // add setIfMissing for language
        if (!value[currentLanguage]) {
            event = event.prepend(setIfMissing({}, [currentLanguage]));
            console.log(event);
        }
        // remove data
        const currentFields = Object.keys(value[currentLanguage] || {});
        fields.forEach((k: IField) => {
            const index = currentFields.indexOf(k.name);
            if (index > -1) currentFields.splice(index, 1);
        });
        if (currentFields.length > 0) {
            currentFields.forEach(key => {
                event = event.prepend(unset([currentLanguage, key]));
            });
        }

        if (!isRoot) {
            event = event.prepend(setIfMissing(type.name === 'object' ? {} : {_type: type.name}));
            if (value) {
                const valueTypeName = value && value._type
                const schemaTypeName = type.name
                if (valueTypeName && schemaTypeName === 'object') {
                  event = event.prepend(unset(['_type']))
                } else if (schemaTypeName !== 'object' && valueTypeName !== schemaTypeName) {
                  event = event.prepend(set(schemaTypeName, ['_type']))
                }
            }
        }
        onChange(event);
    }

    public renderField = (field: IField) => {
        const { currentLanguage } = this.state;
        const { type, value, markers, readOnly, focusPath, onFocus, onBlur, filterField } = this.props
        if (!filterField(type, field) || field.type.hidden) return null;
        const fieldValue = value && value[currentLanguage] && value[currentLanguage][field.name]
        return (
          <Field
            key={`${currentLanguage}.${field.name}`}
            field={field}
            value={fieldValue}
            onChange={this.handleFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
            markers={markers}
            focusPath={focusPath}
            level={type.level}
            readOnly={readOnly}
            filterField={filterField}
          />
        )
    }

    private handleSelectLanguage = (lang: string) => {
        this.setState({
            currentLanguage: lang,
        });
    }

    public focus() {

    }

    public componentDidMount() {
        const { type: { options } } = this.props;
        this.setState({
            currentLanguage: options.languages[0],
        });
    }

    public render() {
        const { currentLanguage } = this.state;
        const { type } = this.props;
        const { fields, options } = type;

        return (
            <div className={styles.root}>
                <div className={styles.switch}>
                    {options.languages.map((lang: string) => (
                        <button
                            key={lang}
                            className={styles.language}
                            disabled={lang === currentLanguage}
                            onClick={() => this.handleSelectLanguage(lang)}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                {fields.map((field) => (
                    this.renderField(field)
                ))}
            </div>
        )
    }
}
export default Input;