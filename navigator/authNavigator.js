import React from "react";
import {createStackNavigator } from '@react-navigation/stack';
import Login from "../src/screen/Login";
import SignUp from "../src/screen/SignUp";


const Stack = createStackNavigator();

const AuthNavigator = () => {
    return(
        <Stack.Navigator initialRouteName = 'Login' screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='SignUp' component={SignUp} />

        </Stack.Navigator>
    )
}

export default AuthNavigator;