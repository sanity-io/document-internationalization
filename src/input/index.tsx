import "regenerator-runtime";
import React from "react";
import slugify from "slugify";
import Fieldset from "part:@sanity/components/fieldsets/default";
import { FormBuilderInput } from "@sanity/form-builder/lib/FormBuilderInput";
import shouldReloadFn from "part:sanity-plugin-intl-input/languages/should-reload?";
import {
  TabPanel,
  TabList,
  Tab,
  Card,
  Flex,
  Spinner,
  Stack,
  Select,
} from "@sanity/ui";
import { ILanguageObject } from "../types/ILanguageObject";
import { getBaseLanguage, getConfig, getLanguagesFromOption } from "../utils";
import { setIfMissing } from "@sanity/form-builder/PatchEvent";
import { Path, Marker } from "@sanity/types";
import { IType } from "../types";
import { DocumentHistoryContext } from "@sanity/desk-tool/lib/panes/documentPane/documentHistory/context";

const createSlug = (input: string) =>
  slugify(input, { replacement: "_" }).replace(/-/g, "_");

type Props = {
  type: IType;
  value: Record<string, any>;
  compareValue?: Record<string, unknown>;
  onChange?: (...args: any[]) => any;
  onFocus: (...args: any[]) => any;
  onBlur: (...args: any[]) => any;
  focusPath?: Path;
  markers?: Marker[];
  level?: number;
  readOnly?: boolean;
  isRoot?: boolean;
  filterField?: (...args: any[]) => any;
  presence?: any[];
};

export const Input = React.forwardRef<any, Props>((props, ref) => {
  const {
    compareValue,
    focusPath,
    markers,
    onBlur,
    onChange,
    onFocus,
    presence,
    type,
    value,
    level,
  } = props;
  const historyContext = React.useContext(DocumentHistoryContext);
  const [fetchingLanguages, setFetchingLanguages] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] =
    React.useState<ILanguageObject | null>(null);
  const [languages, setLanguages] = React.useState<ILanguageObject[]>([]);

  const baseLanguage = React.useMemo(() => {
    const config = getConfig(type.type);
    return getBaseLanguage(languages, type.options.base || config.base);
  }, [type, languages]);
  const selectedLanguage = React.useMemo(() => {
    return currentLanguage ?? baseLanguage;
  }, [currentLanguage, baseLanguage]);

  // @README based on https://www.sanity.io/docs/custom-input-widgets#16fa2d40036b
  const fieldNames = React.useMemo(
    () => type.fields.map((f) => f.name),
    [type.fields]
  );
  const childPresence = React.useMemo(() => {
    if (!presence?.length) return presence;
    return presence.filter((item) => fieldNames.includes(item.path[0]));
  }, [presence, fieldNames]);
  const childMarkers = React.useMemo(() => {
    if (!markers?.length) return markers;
    return markers?.filter((item) =>
      fieldNames.includes(item.path[0] as string)
    );
  }, [markers, fieldNames]);

  const doLoadLanguages = React.useCallback(async () => {
    const shouldReload =
      historyContext.displayed &&
      (languages.length === 0 ||
        (shouldReloadFn && shouldReloadFn(historyContext.displayed)));
    if (shouldReload) {
      setFetchingLanguages(true);
      const config = getConfig(type.type);
      const updated = await getLanguagesFromOption(
        type.options.languages || config.languages,
        historyContext.displayed
      );
      setLanguages(updated);
      setFetchingLanguages(false);
    }
  }, [type, languages, historyContext.displayed]);

  const onLanguageSelectChange = React.useCallback<
    React.FormEventHandler<HTMLSelectElement>
  >(
    (event) => {
      const lang = languages.find(
        (lang) => lang.name === event.currentTarget.value
      );
      if (lang) setCurrentLanguage(lang);
    },
    [currentLanguage, languages]
  );

  const onSelectLanguage = React.useCallback(
    (language: ILanguageObject) => {
      setCurrentLanguage(language);
    },
    [currentLanguage, languages]
  );

  const onFieldChange = React.useCallback(
    (field, fieldPatchEvent) => {
      if (selectedLanguage && onChange) {
        const slug = createSlug(selectedLanguage.name);
        const patchEvent = fieldPatchEvent
          .prefixAll(field.name)
          .prefixAll(slug)
          .prepend(setIfMissing({ _type: type.name }, [slug]))
          .prepend(setIfMissing({ _type: type.name }));
        onChange(patchEvent);
      }
    },
    [selectedLanguage, onChange]
  );

  React.useEffect(() => {
    doLoadLanguages();
  }, [type, historyContext.displayed]);

  if (fetchingLanguages) {
    return (
      <Card>
        <Flex justify="center">
          <Spinner muted />
        </Flex>
      </Card>
    );
  }

  return (
    <Card>
      <Stack space={4}>
        {languages.length > 5 ? (
          <Select
            value={selectedLanguage?.name}
            onChange={onLanguageSelectChange}
          >
            {languages.map((lang) => (
              <option key={lang.name} value={lang.name}>
                {lang.title}
              </option>
            ))}
          </Select>
        ) : (
          <Card padding={1} radius={3} shadow={1} tone="inherit">
            <TabList space={1}>
              {languages.map((lang) => (
                <Tab
                  key={lang.name}
                  id={`${type.name}-${lang.name}-tab`}
                  aria-controls={`${type.name}-panel`}
                  label={lang.title}
                  selected={lang.name === selectedLanguage?.name}
                  onClick={() => onSelectLanguage(lang)}
                />
              ))}
            </TabList>
          </Card>
        )}

        {languages.map((lang) => (
          <TabPanel
            key={lang.name}
            id={`${type.name}-panel`}
            aria-labelledby={`${type.name}-${lang.name}-tab`}
            hidden={selectedLanguage?.name !== lang.name}
          >
            <Fieldset
              legend={type.title} // schema title
              description={type.description} // schema description
              markers={childMarkers} // markers built above
              presence={childPresence} // presence built above
            >
              {type.fields.map((field, i) => {
                return (
                  // Delegate to the generic FormBuilderInput. It will resolve and insert the actual input component
                  // for the given field type
                  <FormBuilderInput
                    key={field.name}
                    level={(level || 0) + 1}
                    ref={i === 0 ? ref : null}
                    type={field.type}
                    value={value && value[createSlug(lang.name)]?.[field.name]}
                    onChange={(patchEvent) => onFieldChange(field, patchEvent)}
                    path={[field.name]}
                    focusPath={focusPath}
                    readOnly={field.readOnly}
                    presence={presence}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    compareValue={compareValue}
                  />
                );
              })}
            </Fieldset>
          </TabPanel>
        ))}
      </Stack>
    </Card>
  );
});

export default Input;
