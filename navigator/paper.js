import React, { useState, useEffect } from 'react';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from '../src/screen/Home';
import RecommendationPage from '../src/screen/RecommendationPage';
import ProfileScreen from '../src/screen/profile/Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locales } from '../src/screen/locales';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { View, ActivityIndicator,StyleSheet} from 'react-native';




const Tab = createMaterialBottomTabNavigator();

const MyTabs = () => {
  

  const fetchLanguagePreference = async () => {
    const user = auth().currentUser;

    if (user) {
        // Try to fetch from Firestore
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        const firestoreLanguage = userDoc.data()?.language;

        if (firestoreLanguage) {
            setSelectedLanguage(firestoreLanguage);
        } else {
            // Fall back to AsyncStorage if Firestore doesn't have the language
            const storedLanguage = await AsyncStorage.getItem('language');
            if (storedLanguage) {
                setSelectedLanguage(storedLanguage);
            }
        }
    }
    setLanguageLoaded(true);
};

useFocusEffect(
  React.useCallback(() => {
      fetchLanguagePreference();
     

       // Force re-fetch when the screen is focused
      
  }, [selectedLanguage])
);


useEffect(() => {
  fetchLanguagePreference();
  

  
}, []);




const t = (key) => locales[selectedLanguage][key] || key;

const [selectedLanguage, setSelectedLanguage] = useState('en'); 
const [languageLoaded, setLanguageLoaded] = useState(false);

if (!languageLoaded) {
  return (
       <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f3ce13" />
      </View>)
}

    return (
      <Tab.Navigator
      initialRouteName="Home"
      activeColor="#f3ce13"
      inactiveColor="white"
      barStyle={{ backgroundColor: 'black'}}
      shifting={true} 
      sceneAnimationEnabled={true}
      sceneAnimationType= "shifting"
      
      
      theme={{colors: {secondaryContainer: 'black'}}}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconComponent;
  
            // Her sekmeye göre ilgili ikon bileşenini oluşturun
            if (route.name === 'Home') {
              iconComponent = focused ? (
                <MaterialCommunityIcons name="home" size={26} color={color} />
              ) : (
                <MaterialCommunityIcons name="home-outline" size={26} color={color} />
              );
            } else if (route.name === 'Recommend') {
              iconComponent = focused ? (
                <MaterialCommunityIcons name="gift-open" size={27} color={color} />
              ) : (
                <MaterialCommunityIcons name="gift-outline" size={27} color={color} />
              );
            } else if (route.name === 'Profile') {
              iconComponent = focused ? (
                <MaterialCommunityIcons name="account" size={26} color={color} />
              ) : (
                <MaterialCommunityIcons name="account-outline" size={26} color={color} />
              );size
            }
  
            return iconComponent;
          },
        })}
      
      >
        <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: t('home') }}/>
        <Tab.Screen name="Recommend" component={RecommendationPage} options={{ tabBarLabel: t('recommend') }}/>
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('profile') }}/>
      </Tab.Navigator>
    );
  }



  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#161618',
  },
});
export default MyTabs;