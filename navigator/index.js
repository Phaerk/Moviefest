import React, { useState, useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';

import Mainnav from "./navigator";
import AuthNavigator from "./authNavigator";

import auth from '@react-native-firebase/auth';

const AppContainer = () => {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();

    function onAuthStateChange(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(onAuthStateChange);
        return unsubscribe;
    }, []);

    if (initializing) return null;

    return (
        <NavigationContainer>
            {user ? <Mainnav /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppContainer;
