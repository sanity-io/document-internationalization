import React from 'react'
import styled from 'styled-components'
import {Grid, rem} from '@sanity/ui'
import flagOverrides from 'part:@sanity/document-internationalization/ui/flags?'
import { SingleFlag } from './SingleFlag'
import type {ILanguageObject} from '../../../types'

type SizeProps = { size?: number }
type MissingProps = { missing?: boolean }
type Props = {
  isMissing?: boolean
  language: ILanguageObject
}

const FlagBox = styled.div<SizeProps & MissingProps>`
  grid-row: 1;
  grid-column: 1;
  font-family: initial;
  vertical-align: middle;
  filter: ${props => {
    if (props.missing) {
      return 'grayscale(100%)'
    }
  }};
  font-size: ${props => {
    const { sizes } = props.theme.sanity.fonts.heading
    if (props.size) {
      return rem(sizes[props.size].fontSize)
    }
  }};
  &:first-child:not(:last-child) {
    transform: translateY(-.2em) translateX(${props => {
      const { space } = props.theme.sanity
      return rem(-space[3])
    }});
  }
  &:last-child:not(:first-child) {
    transform: translateY(.2em);
  }
`

export const LangCultureFlagsBlock: React.FC<Props> = ({language,isMissing}) => {
  const languageAsVariableName = React.useMemo(
    () => language.id.replace(/[^a-zA-Z]/g, '_'),
    [language.id]
  )
  const FlagComponent = React.useMemo(
    () =>
      flagOverrides && languageAsVariableName in flagOverrides
        ? flagOverrides[languageAsVariableName]
        : SingleFlag,
    [languageAsVariableName]
  )

  // Split a country and language if both supplied
  // Expects language first, then country: `en-us` or `en`
  const [codeLanguage, codeCountry] = React.useMemo(
    () => (new RegExp(/[_-]/).test(language.id) ? language.id.split(/[_-]/) : [language.id, ``]),
    [language.id]
  )

  return (
    <Grid paddingLeft={3} cols={1} rows={1}>
      {codeCountry && codeLanguage && (
        <>
          <FlagBox size={4} missing={isMissing}>
            <FlagComponent code={codeCountry} />
          </FlagBox>
          <FlagBox size={4} missing={isMissing}>
            <FlagComponent code={codeLanguage} />
          </FlagBox>
        </>
      )}
      {!codeCountry && codeLanguage && (
        <FlagBox size={4} missing={isMissing}>
          <FlagComponent code={codeLanguage} />
        </FlagBox>
      )}
    </Grid>
  )
}
