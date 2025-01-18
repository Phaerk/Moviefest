import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Auth } from '../services';
import { Dialog, Paragraph, Button, Portal, PaperProvider, MD2DarkTheme,MD2LightTheme } from 'react-native-paper';


const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});

    useEffect(() => {
        GoogleSignin.configure({
            offlineAccess: true,
            webClientId: '283376106620-eass1b31j5cn7bcq8g7rnolftnlbtljp.apps.googleusercontent.com',
            androidClientId: ['283376106620-okhp7c2hetfb0s65fionb5bi1qjtpeu9.apps.googleusercontent.com','283376106620-n8odigrppjq54oibb0j508m4nbkl8taf.apps.googleusercontent.com','283376106620-mlg2gns1mc47jfa6ndotiv3rrb68u1ug.apps.googleusercontent.com'],
            scopes: ['profile', 'email'],
        });
    }, []);

    const handleLogin = async () => {
        try {
            await Auth.signIn(email, password);
            // Başarılı giriş sonrası yönlendirme işlemi
            navigation.navigate('MainTabs');
        } catch (error) {
              // Konsola hata mesajını yazdır
            showAlert('Login Failed', 'Please check your email and password and try again.');  // Hata alert'i göster
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
            const userCredential = await auth().signInWithCredential(googleCredential);
            const user = userCredential.user;

            // Save user details to Firestore
            const userRef = firestore().collection('users').doc(user.uid);
            const userSnapshot = await userRef.get();

            if (!userSnapshot.exists) {
                await userRef.set({
                    name: user.displayName,
                    email: user.email,
                    profileImageUrl: user.photoURL,
                });
            }

            // Navigate to the MainTabs screen
            navigation.navigate('MainTabs');
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("Sign in cancelled");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("Sign in in progress");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log("Play services not available");
            } else {
                console.log(error);
                showAlert('Google Sign-In Failed', 'An error occurred during Google Sign-In.');  // Google Sign-In hatası alert'i göster
            }
        }
    };

    const handleFacebookLogin = async () => {
        // Implement Facebook login if needed
    };

    const showAlert = (title, message) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setDialogVisible(true);
    };

    return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome</Text>
                <TextInput
                    placeholder='Enter email'
                    onChangeText={text => setEmail(text)}
                    style={styles.textInput}
                    placeholderTextColor="#b0aeae"
                />
                <TextInput
                    placeholder='Enter password'
                    onChangeText={text => setPassword(text)}
                    style={styles.textInput}
                    secureTextEntry={true}
                    placeholderTextColor="#b0aeae"
                />
                <TouchableOpacity onPress={handleLogin}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Login</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupText}>Create account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGoogleLogin}>
                    <View style={styles.googleButton}>
                        <Text style={styles.buttonText}>Login with Google</Text>
                    </View>
                </TouchableOpacity>
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
                                Ok
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
        surface: 'black', // Arka plan rengi
        primary: '#f3ce13', // Ana buton rengi
        accent: '#d9534f', // Vurgulayıcı renk
        text: '#fff', // Metin rengi
        onSurface: '#f3ce13', // Üzerinde metin rengi
        backdrop: 'rgba(0, 0, 0, 0.5)', // Arka plan opaklık rengi
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161618',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
    },
    textInput: {
        backgroundColor: '#2c2c2c',
        color: 'white',
        fontSize: 18,
        width: '100%',
        height: 48,
        marginVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#444',
        shadowColor: 'grey',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        backgroundColor: '#28af28',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupText: {
        marginTop: 20,
        fontSize: 17,
        color: 'grey',
        textDecorationLine: 'underline',
    },
    googleButton: {
        backgroundColor: '#EA4335',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        height:41,
    },
    confirmButton: {
        backgroundColor: '#f3ce13',
        marginLeft:10,
        height:41,
    },
    cancelButtonText: {
        color: '#f3ce13',
    },
    confirmButtonText: {
        color: 'black',
        paddingHorizontal: 20
    },
});

export default Login;
