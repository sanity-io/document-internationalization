import React from 'react'
import styled from 'styled-components'
import {Box, Grid} from '@sanity/ui'
import {IExtendedLanguageObject} from '../../../types'
import {UiMessages} from '../../../constants'
import {baseToTop} from '../../../utils/baseToTop'
import {LanguageSelectLabel} from './LanguageSelectLabel'
import {LanguageSelectListItem} from './LanguageSelectListItem'

type Props = {
  draftLanguageObjects: IExtendedLanguageObject[]
  publishedLanguageObjects: IExtendedLanguageObject[]
  missingLanguageObjects: IExtendedLanguageObject[]
}

const Divider = styled(Box)`
  border-bottom: 1px solid var(--card-shadow-outline-color);
`

const SelectorBox = styled(Box)`
  minwidth: 250;
`

export const LanguageSelectList: React.FC<Props> = ({
  draftLanguageObjects,
  publishedLanguageObjects,
  missingLanguageObjects,
}) => {
  const showDivider = React.useMemo(
    () =>
      Boolean(
        !!(draftLanguageObjects.length || publishedLanguageObjects.length) &&
          missingLanguageObjects.length
      ),
    [draftLanguageObjects, publishedLanguageObjects, missingLanguageObjects]
  )

  const existingLanguageObjects = React.useMemo(() => {
    return [
      ...draftLanguageObjects.map((lang) => ({
        ...lang,
        status: 'draft' as const,
      })),
      ...publishedLanguageObjects.map((lang) => ({
        ...lang,
        status: 'published' as const,
      })),
    ]
      .sort(baseToTop)
      .reverse()
  }, [draftLanguageObjects, publishedLanguageObjects])

  return (
    <SelectorBox>
      {!!existingLanguageObjects.length && (
        <Box>
          <LanguageSelectLabel>{UiMessages.languageSelect.listLabels.existing}</LanguageSelectLabel>
          <Grid columns={1} gap={1}>
            {existingLanguageObjects.map((language) => (
              <LanguageSelectListItem
                key={language.id}
                status={language.status}
                language={language}
              />
            ))}
          </Grid>
        </Box>
      )}

      {showDivider && <Divider marginY={1} />}

      {!!missingLanguageObjects.length && (
        <Box>
          <LanguageSelectLabel>{UiMessages.languageSelect.listLabels.missing}</LanguageSelectLabel>
          <Grid columns={1} gap={1}>
            {missingLanguageObjects.map((language) => (
              <LanguageSelectListItem key={language.id} status="missing" language={language} />
            ))}
          </Grid>
        </Box>
      )}
    </SelectorBox>
  )
}
