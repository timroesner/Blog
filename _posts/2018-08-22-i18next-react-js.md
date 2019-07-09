---
layout: post
title: Localizing a React.js App with i18next
permalink: i18next-localizing-react-js
image: globe.jpg
---

### Prerequisites:
- [React.js App](https://github.com/facebook/create-react-app)
- [react-i18next](https://github.com/i18next/react-i18next)

### Setup
After you installed i18next you need to create an **i18n.js** file preferably in the same folder as your **app.js**. In this file you will initialise the locale, your translations and you can even add custom formatters. For reference here is what my file looks like: 
**Note**: *Be sure to call your namespace “translation” regardless of what you name your files, as this is the default and ensures i18next will find your translations.*

```javascript
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import de from '../public/locales/de/translations.json';
import en from '../public/locales/en/translations.json'; 

i18n.use(reactI18nextModule).init({    
   fallbackLng: 'en',    
   lng: navigator.language || navigator.userLanguage,     
   resources: {        
      en: {            
         translation: en        
      },        
      de: {            
         translation: de        
      }    
   },     
   interpolation: {        
      escapeValue: false   
   },    
 
   wait: true
}); 
export default i18n;
```

Next you will create json files for your translations. I’ve decided to put these into the src folder and started a structure like this: locale → en → translations.json. Which makes it easy to add additional languages. In your json files you will create a recognisable key and the translation in that language. Here is a small example of such a file:
```javascript
{
   "group": "Gruppe",
   "group_plural": "Gruppen",
   "blog_title": "Eine React.js App mit i18next lokalisieren"
}
```
As you can see I am making use of the build in pluralization of i18next, this is especially useful if you don’t know which will be used until runtime. Here is a code example showing this functionality:
```javascript
i18n.t('group', {count: numberOfGroups})
```

### Connecting
If you are using HOCs it’s best to inject the translations, as this allows you to change the language on the fly. I also happen to use redux, so most of my components are already encapsulated, but that’s no problem as we can simply encapsulate these wrapped components as well. Here is what it looks like when you export your HOC:
```javascript
import { translate } from 'react-i18next';
// If you are using redux or other wrappers
export default translate()(
   connect()(AccountEditorContainer)
);
// Just i18next
export default translate()(AccountEditorContainer);
```

After you connected your component you will be able to access your translations like this:
```javascript
this.props.t('blog_title')
```
**Note**: *For convince use* `const { t } = this.props`  
  

### Standalone
However you do not need to do this, and sometimes you want to use i18next in sagas or functions that don’t export a HOC. For these cases you can import your i18n.js file directly, which will look like this:
```javascript
import i18n from '../i18n';
i18n.t('blog_title')
```

### Summary
i18next is a fast and easy way to localize your app as the web is becoming more global. The initial setup might take some effort especially when you already have a completed app. However adding new strings is very simply, which is why I’d recommend starting this process early.