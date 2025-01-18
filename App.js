import React from 'react'
import AppContainer from './navigator'
import { View } from 'react-native'
import { LanguageProvider } from './LanguageContext'


const App = () => {
    return(
        <>
           <LanguageProvider>
           <AppContainer/>
           </LanguageProvider>
                
            </>
    )
}

export default App