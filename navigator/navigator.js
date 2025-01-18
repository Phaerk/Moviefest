import React from "react";
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Home from "../src/screen/Home";
import MovieDetailsScreen from "../src/screen/MovieDetails";
import RecommendationPage from "../src/screen/RecommendationPage";
import MovieDetailsRecommend from "../src/screen/MovieDetailsRecommend";
import ProfileScreen from "../src/screen/profile/Profile";
import SettingsScreen from "../src/screen/profile/settings/settings";
import ProfileSettings from "../src/screen/profile/settings/profileSettings";
import WatchedMovies from "../src/screen/profile/settings/watchedMovies";
import LikedMovies from "../src/screen/profile/settings/likedMovies";

import ChangePassword from "../src/screen/profile/settings/changePassword";


import MyTabs from "../navigator/paper";




const Stack = createStackNavigator();

const Mainnav = () => {
    return (
        <Stack.Navigator
            
            screenOptions={{
                headerShown: false,
                ...TransitionPresets.FadeFromBottomAndroid,  // Bu satır animasyon preset'ini ekler
            }}
        >
            <Stack.Screen name='MainTabs' component={MyTabs} />
            <Stack.Screen name='Home' component={Home} />
            <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
            <Stack.Screen name="RecommendationPage" component={RecommendationPage} options={{ title: 'Recommend Me A Film' }} />
            <Stack.Screen name="MovieDetailsRecommend" component={MovieDetailsRecommend} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettings} options={{ title: 'Profile Settings' }} />
            <Stack.Screen name="WatchedMovies" component={WatchedMovies} options={{ title: 'Watched Movies' }} />
            <Stack.Screen name="LikedMovies" component={LikedMovies} options={{ title: 'Liked Movies' }} />
           
            <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ title: 'Change Password' }} />
            
        </Stack.Navigator>
    );
}

export default Mainnav;
