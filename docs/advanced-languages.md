# Advanced Language Definition
You can also pass a language objects or a GROQ query to the languages option for more advanced language handling.

## Language objects
If you pass an object with `name` and `title` to the languages array you can separate the data key and the visualized language name in the UI.
Eg:
```
languages: [
  { name: 'en_us', title: 'English (US)' },
  { name: 'en_gb', title: 'English (UK)' }
]
```

## GROQ query
It is also possible to pass a GROQ query to the languages option to dynamically fetch the available languages.
Eg:
```
languages: {
  query: '*[_type=="language"]{_id,name}',
  // these are the object paths to get out of the results to use for name and title
  // it is also possible to pass a simple string which will then be used for both title and name
  value: {
    title: 'name',
    name: '_id'
  }
}
```