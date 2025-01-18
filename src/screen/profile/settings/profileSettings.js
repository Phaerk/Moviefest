import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import IconImage from './assets/yellowback.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dialog, Paragraph, Button, Portal, PaperProvider, MD2DarkTheme } from 'react-native-paper';

import { locales } from '../../locales';

// Uygulama teması
const theme = {
    ...MD2DarkTheme,
    colors: {
        ...MD2DarkTheme.colors,
        surface: 'black', // Arka plan rengi
        primary: '#f3ce13', // Ana buton rengi
        accent: '#d9534f', // Vurgulayıcı renk
        text: '#fff', // Metin rengi
        onSurface: '#f3ce13', // Üzerinde metin rengi
        backdrop: 'rgba(0, 0, 0, 0.5)', // Arka plan opaklık rengi
    },
};

const ProfileSettings = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});
    const [uploading, setUploading] = useState(false);  // Yükleme durumunu kontrol eden state
   

    const user = auth().currentUser;

    useEffect(() => {
        

        const user = auth().currentUser;
        if (user && user.providerData[0].providerId === 'google.com') {
            setIsGoogleUser(true);
        }

        
    }, []);

    

    useEffect(() => {
       
        if (user) {
            fetchUserProfile();
        }
    }, [user]);


   


    
    const fetchUserProfile = async () => {
        try {
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                setName(userData.name);
                setProfileImageUrl(userData.profileImageUrl || user.photoURL);
            } else {
                setName(user.displayName);
                setProfileImageUrl(user.photoURL);
            }
            setIsGoogleUser(user.providerData.some(provider => provider.providerId === 'google.com'));
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const userRef = firestore().collection('users').doc(user.uid);
            await userRef.update({
                name,
                profileImageUrl
            });
            showAlert('Profile Updated', 'Your profile has been updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert('Error', 'There was an error updating your profile.');
        }
    };

    const handleSelectPhoto = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets.length > 0) {
                const source = response.assets[0];
                const uploadUri = Platform.OS === 'ios' ? source.uri.replace('file://', '') : source.uri;
                await uploadImage(uploadUri);
            }
        });
    };

    const showAlert = (title, message) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setDialogVisible(true);
    };

    const uploadImage = async (uri) => {
        setUploading(true);  // Yükleme başladığında
        const storageRef = storage().ref('profile_pictures/${user.uid}');
        try {
            await storageRef.putFile(uri);
            const url = await storageRef.getDownloadURL();
            await firestore().collection('users').doc(user.uid).update({ profileImageUrl: url });
            setProfileImageUrl(url);
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('Error', 'There was an error uploading your profile picture.');
        } finally {
            setUploading(false);  // Yükleme bittiğinde
        }
    };

     return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={IconImage} style={styles.backButtonIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{"Profile Settings"}</Text>
                <View style={styles.form}>
                    <Text style={styles.label}>{"Name"}</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder={"Enter your name"}
                        placeholderTextColor="#888"
                    />
                    <Text style={styles.label}>{"Profile Photo"}</Text>
                    <TouchableOpacity style={styles.photoButton} onPress={handleSelectPhoto}>
                        <Text style={styles.photoButtonText}>{"Select Photo"}</Text>
                    </TouchableOpacity>
                    {profileImageUrl ? <Image source={{ uri: profileImageUrl }} style={styles.profilePhoto} /> : null}
                    {uploading && <ActivityIndicator size="large" color="#f3ce13" style={styles.loader} />}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={uploading}>
                        <Text style={styles.saveButtonText}>{"Save"}</Text>
                    </TouchableOpacity>
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
                                onPress={async () => {
                                    await onConfirm();
                                    setDialogVisible(false);
                                }}
                                style={styles.confirmButton}
                                labelStyle={styles.confirmButtonText}
                            >
                                {"OK"}
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </PaperProvider>
    );
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
        textAlign: 'center',
        marginBottom: 20,
    },
    form: {
        marginTop: 20,
    },
    label: {
        fontSize: 18,
        color: '#f3ce13',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#2c2c2c',
        color: '#f3ce13',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    photoButton: {
        backgroundColor: '#f3ce13',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    photoButtonText: {
        color: '#161618',
        fontWeight: 'bold',
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#f3ce13',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#161618',
        fontWeight: 'bold',
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
    confirmButton: {
        backgroundColor: '#f3ce13',
        marginLeft: 10,
    },
    confirmButtonText: {
        color: 'black',
        paddingHorizontal: 20,
    },
    loader: {
        marginBottom: 20,
    },
});

export default ProfileSettings;