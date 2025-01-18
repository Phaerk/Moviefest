import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconImage from './assets/yellowback.png';
import auth from '@react-native-firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { Dialog, Paragraph, Button, Portal, PaperProvider, MD2DarkTheme } from 'react-native-paper';
import { locales } from '../../locales';

const ChangePassword = () => {
    const navigation = useNavigation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});

   

    
    

    const showCustomDialog = (title, message, onConfirmAction = () => {}) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setOnConfirm(() => onConfirmAction);
        setDialogVisible(true);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showCustomDialog("Error", "Please write your password.");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            showCustomDialog("Error", "New password and confirm password do not match.");
            return;
        }
    
        const user = auth().currentUser;
    
        if (user) {
            const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
    
            try {
                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(newPassword);
                showCustomDialog("Success", "Password changed successfully.", () => navigation.goBack());
            } catch (error) {
                if (error.code === 'auth/invalid-credential') {
                    showCustomDialog("Error", "The current password is incorrect.");
                } else if (error.code === 'auth/too-many-requests') {
                    showCustomDialog("Error", "Too many requests. Access to this account has been temporarily disabled due to many failed login attempts. Please try again later or reset your password.");
                } else {
                    showCustomDialog("Error", "Failed to change password. Please try again.");
                }
                console.error('Error changing password:', error);
            }
        } else {
            showCustomDialog("Error", "No user is logged in.");
        }
    };

    return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={IconImage} style={styles.backButtonIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{"Change Password"}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={"Current Password"}
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder={"New Password"}
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder={"Confirm New Password"}
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
                    <Text style={styles.submitButtonText}>{"Change Password"}</Text>
                </TouchableOpacity>

                <Portal>
                    <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                        <Dialog.Title style={styles.dialogTitle}>{dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={styles.dialogMessage}>{dialogMessage}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                style={styles.confirmButton}
                                labelStyle={styles.confirmButtonText}
                                onPress={() => {
                                    setDialogVisible(false);
                                    onConfirm(); // Execute the onConfirm action if provided
                                }}
                            >
                                {"ok"}
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
        textAlign: 'center',
        marginBottom: 20,
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
    input: {
        backgroundColor: '#333',
        color: '#fff',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    submitButton: {
        backgroundColor: '#f3ce13',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#161618',
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
    },
    confirmButton: {
        backgroundColor: '#f3ce13',
        marginLeft: 10,
    },
    cancelButtonText: {
        color: '#f3ce13',
    },
    confirmButtonText: {
        color: 'black',
    },
});

export default ChangePassword;
