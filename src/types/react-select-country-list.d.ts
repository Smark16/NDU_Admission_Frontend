declare module 'react-select-country-list' {
  const countryList: () => {
    getData: () => Array<{ value: string; label: string }>
    getLabel: (code: string) => string
    getValue: (label: string) => string
  }
  export default countryList
}