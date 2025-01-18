import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Dialog, Paragraph, Button, Portal, PaperProvider, MD2DarkTheme } from 'react-native-paper';

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

const Signup = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});

    const handleEmailVerification = async () => {
        try {
            // Check if email is valid and not already in use
            const signInMethods = await auth().fetchSignInMethodsForEmail(email);
            if (signInMethods.length > 0) {
                showAlert('Signup Failed', 'This email address is already in use.');
                return;
            }

            // Create a temporary user
            const tempUserCredential = await auth().createUserWithEmailAndPassword(email, password);
            const tempUser = tempUserCredential.user;

            // Send email verification
            await tempUser.sendEmailVerification();

            // Show verification email sent dialog
            showAlert('Verification Email Sent', 'Please check your email and verify your account.');

            // Sign out the temporary user
            await auth().signOut();

            // Wait for the user to verify their email
            auth().onAuthStateChanged(async (user) => {
                if (user && user.emailVerified) {
                    // Proceed with registration (e.g., save the user's name to Firestore)
                    await tempUser.updateProfile({ displayName: name });
                    await firestore().collection('users').doc(tempUser.uid).set({
                        name,
                        email,
                    });

                    // Show success message and navigate to the login screen
                    showAlert('Registration Successful', 'Your account has been created. Please log in.');
                }
            });
        } catch (error) {
            // Handle errors
            if (error.code === 'auth/invalid-email') {
                showAlert('Signup Failed', 'This email address is invalid.');
            } else if (error.code === 'auth/weak-password') {
                showAlert('Signup Failed', 'The password is too weak.');
            } else {
                showAlert('Signup Failed', 'An error occurred. Please try again.');
            }
        }
    };

    const showAlert = (title, message) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setDialogVisible(true);
    };

    return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <Text style={styles.title}>Create Account</Text>
                <TextInput
                    placeholder='Enter name'
                    onChangeText={text => setName(text)}
                    style={styles.textInput}
                    placeholderTextColor="#b0aeae"
                />
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
                <TouchableOpacity onPress={handleEmailVerification}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.signupText}>Have an account? Login</Text>
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
                                onPress={() => setDialogVisible(false)}
                                style={styles.confirmButton}
                                labelStyle={styles.confirmButtonText}
                            >
                                OK
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
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
        height: 41,
    },
    confirmButtonText: {
        color: 'black',
        paddingHorizontal: 20,
    },
});

export default Signup;
