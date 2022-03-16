import React from 'react'

type Props = unknown
type State = {
  error: boolean | Error
}

export class LanguageFilterErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {error: false}
  }

  public static getDerivedStateFromError(error: Error): State {
    return {error}
  }

  public render() {
    const {children} = this.props
    const {error} = this.state
    if (error) return null
    return children
  }
}
