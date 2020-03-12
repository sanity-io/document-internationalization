import 'regenerator-runtime';
import * as React from 'react';
import get from 'lodash.get';
import slugify from 'slugify';
import styles from './input.scss';
import PatchEvent, { setIfMissing, unset, set } from '@sanity/form-builder/lib/PatchEvent';
import Field from '@sanity/form-builder/lib/inputs/ObjectInput/Field';
import { IType } from '../types/IType';
import client from 'part:@sanity/base/client'
import { ILanguageQuery } from '../types/ILanguageQuery';
import { ILanguageObject } from '../types/ILanguageObject';
import { Tlanguage } from '../types/TLanguage';

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
    currentLanguage: ILanguageObject | null;
    fetchingLanguages: boolean;
    languages: ILanguageObject[];
}

const createSlug = (input: string) => slugify(input, { replacement: '_' }).replace(/-/g, '_');

class Input extends React.PureComponent<IProps, IState> {
    public state: IState = {
        currentLanguage: null,
        fetchingLanguages: false,
        languages: [],
    }

    private get client(): import('@sanity/client').SanityClient {
        return client;
    }

    /**
     * Taken from ObjectInput in native sanity library
     */
    public onFieldChange = (fieldEvent: PatchEvent, field: IField) => {
        const { currentLanguage } = this.state;
        const { type, value = {}, isRoot, onChange } = this.props;
        const { fields } = type;
        if (currentLanguage) {
            const slug = createSlug(currentLanguage.name);
            let event = fieldEvent
                .prefixAll(field.name)
                .prefixAll(slug);
            // add setIfMissing for language
            if (!value[slug]) {
                event = event.prepend(setIfMissing({}, [slug]));
            }
            // remove data
            const currentFields = Object.keys(value[slug] || {});
            fields.forEach((k: IField) => {
                const index = currentFields.indexOf(k.name);
                if (index > -1) currentFields.splice(index, 1);
            });
            if (currentFields.length > 0) {
                currentFields.forEach(key => {
                    event = event.prepend(unset([slug, key]));
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
    }

    private onSelectLanguage = (lang: ILanguageObject) => {
        this.setState({
            currentLanguage: lang,
        });
    }

    private normalizeLanguagesList = (langauges: Tlanguage[]): ILanguageObject[] => {
        return langauges.map(l => {
            if (typeof l === 'string') return { title: l, name: l };
            return l;
        })
    }

    public renderField = (field: IField) => {
        const { currentLanguage } = this.state;
        const { type, value, markers, readOnly, focusPath, onFocus, onBlur, filterField } = this.props
        if (!filterField(type, field) || field.type.hidden || !currentLanguage) return null;
        const slug = createSlug(currentLanguage.name);
        const fieldValue = value && value[slug] && value[slug][field.name]
        return (
          <Field
            key={`${currentLanguage}.${field.name}`}
            field={field}
            value={fieldValue}
            onChange={this.onFieldChange}
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

    public loadLanguages = async () => {
        const { type: { options } } = this.props;
        const languages: IState['languages'] = this.normalizeLanguagesList(Array.isArray(options.languages) ? options.languages : await (async () => {
            const q = options.languages as ILanguageQuery;
            const r = await this.client.fetch(q.query);
            const value = q.value;
            if (typeof value === 'string') return r.map(l => get(l, value));
            return r.map(l => ({
                name: get(l, value.name),
                title: get(l, value.title),
            }));
        })());
        this.setState({
            languages,
            currentLanguage: languages[0],
        });
    }

    public focus() {
    }

    public componentDidMount() {
        this.loadLanguages();
    }

    public render() {
        const { currentLanguage, languages } = this.state;
        const { type } = this.props;
        const { fields, options } = type;

        return (
            <div className={styles.root}>
                <div className={styles.switch}>
                    {languages.map(lang => (
                        <button
                            key={lang.name}
                            className={styles.language}
                            disabled={lang.name === currentLanguage.name}
                            onClick={() => this.onSelectLanguage(lang)}
                        >
                            {lang.title}
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