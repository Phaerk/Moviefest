import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image,  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Auth } from '../../../services';
import IconImage from './assets/yellowback.png';
import WatchedIcon from './assets/watched_icon4.png';
import LikedIcon from './assets/liked.png';

import PasswordIcon from './assets/password4.png';
import DeleteIcon from './assets/delete2.png';
import LogoutIcon from './assets/logout11.png';
import ProfileIcon from './assets/profilesettings3.png';
import OkIcon from './assets/okicon.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dialog, Paragraph, Button, Portal, PaperProvider, MD2DarkTheme } from 'react-native-paper';
import { BannerAd } from 'react-native-google-mobile-ads';






const SettingsScreen = () => {
    const navigation = useNavigation();
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});
  

    useEffect(() => {
       
        const user = auth().currentUser;
        if (user && user.providerData[0].providerId === 'google.com') {
            setIsGoogleUser(true);
        }

        
    }, []);




    const showAlert = (title, message, onConfirmAction) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setOnConfirm(() => onConfirmAction);
        setDialogVisible(true);
    };

    const handleLogout = () => {
        showAlert("Log Out", "Are you sure you want to log out?", () => Auth.signOut());
    };

    const handleDeleteAccount = async () => {
        showAlert("Delete Account", "Are you sure you want to delete your account?", async () => {
            try {
                await firestore().collection('users').doc(auth().currentUser.uid).delete();
                await auth().currentUser.delete();
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        });
    };

   
    return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={IconImage} style={styles.backButtonIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{"Settings"}</Text>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{"Preferences"}</Text>
                    <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ProfileSettings')}>
                        <Image source={ProfileIcon} style={styles.optionIcon} />
                        <Text style={styles.optionText}>{"Profile Settings"}</Text>
                        <Image source={OkIcon} style={styles.optionArrowIcon} />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('WatchedMovies')}>
                        <Image source={WatchedIcon} style={styles.optionIcon} />
                        <Text style={styles.optionText}>{"Watched Movies"}</Text>
                        <Image source={OkIcon} style={styles.optionArrowIcon} />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('LikedMovies')}>
                        <Image source={LikedIcon} style={styles.optionIcon} />
                        <Text style={styles.optionText}>{"Liked Movies"}</Text>
                        <Image source={OkIcon} style={styles.optionArrowIcon} />
                    </TouchableOpacity>
                    
                    
                </View>


                


                    
                <View style={styles.bannerAdContainer}>
                    <BannerAd 
                        size={"375x70"}
                        unitId={"ca-app-pub-8053683961185907/6493341560"} 
                        onAdFailedToLoad={(error) => console.error(error)}
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{"Profile Settings"}</Text>
                    {!isGoogleUser && (
                        <>
                            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ChangePassword')}>
                                <Image source={PasswordIcon} style={styles.optionIcon} />
                                <Text style={styles.optionText}>{"Change Password"}</Text>
                                <Image source={OkIcon} style={styles.optionArrowIcon} />
                            </TouchableOpacity>
                            <View style={styles.separator} />
                        </>
                    )}
                    <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
                        <Image source={DeleteIcon} style={styles.optionIcon} />
                        <Text style={styles.optionText}>{"Delete Account"}</Text>
                        <Image source={OkIcon} style={styles.optionArrowIcon} />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.option} onPress={handleLogout}>
                        <Image source={LogoutIcon} style={styles.optionIcon} />
                        <Text style={styles.optionText}>{"Log Out"}</Text>
                        <Image source={OkIcon} style={styles.optionArrowIcon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.bannerAdContainer}>
                    <BannerAd 
                        size={"375x70"}
                        unitId={"ca-app-pub-8053683961185907/6493341560"} 
                        onAdFailedToLoad={(error) => console.error(error)}
                    />
                </View>
                <Portal>
                    <Dialog
                        visible={dialogVisible}
                        onDismiss={() => setDialogVisible(false)}
                        theme={theme}
                    >
                        <Dialog.Title style={styles.dialogTitle}>{dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={styles.dialogMessage}>{dialogMessage}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                onPress={() => setDialogVisible(false)}
                                style={styles.cancelButton}
                                labelStyle={styles.cancelButtonText}
                            >
                                {"Cancel"}
                            </Button>
                            <Button
                                onPress={async () => {
                                    await onConfirm();
                                    setDialogVisible(false);
                                }}
                                style={styles.confirmButton}
                                labelStyle={styles.confirmButtonText}
                            >
                                {"Confirm"}
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </PaperProvider>
    );
};


const theme = {
    ...MD2DarkTheme,
    colors: {
        ...MD2DarkTheme.colors,
        surface: 'black',
        primary: '#f3ce13',
        accent: '#d9534f',
        text: '#fff',
        onSurface: '#f3ce13',
        backdrop: 'rgba(0, 0, 0, 0.5)',
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161618',
        padding: 15,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 5,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2c2c2c',
        padding: 15,
        borderRadius: 5,
    },
    optionl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2c2c2c',
        padding: 0,
        paddingLeft:15,
        borderRadius: 5,
        marginBottom: 15,
    },
    optionIcon: {
        width: wp(7.656),
        height: wp(7.656),
        marginRight: 10,
    },
    optionArrowIcon: {
        width: wp(5),
        height: wp(5),
    },
    optionText: {
        fontSize: 18,
        color: '#f3ce13',
        textAlign: 'left',
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#f3ce13',
        marginVertical: 1,
    },
    backButton: {
        padding: wp(1.276),
        borderRadius: 5,
        position: 'absolute',
        top: hp(2.56),
        left: wp(2),
        zIndex: 1,
    },
    backButtonIcon: {
        width: wp(7.656),
        height: wp(7),
    },
    dialogTitle: {
        color: '#f3ce13',
        fontWeight: 'bold',
    },
    dialogMessage: {
        color: 'white',
    },
    cancelButton: {
        backgroundColor: '#4e4e4e',
        height: 41,
    },
    confirmButton: {
        backgroundColor: '#f3ce13',
        marginLeft: 10,
        height: 41,
    },
    cancelButtonText: {
        color: '#f3ce13',
    },
    confirmButtonText: {
        color: 'black',
    },
    bannerAdContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '98%',
        marginBottom: 5,
    },
    
   
});

export default SettingsScreen;