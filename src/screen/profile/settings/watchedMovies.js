import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import IconImage from './assets/yellowback.png';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import auth from '@react-native-firebase/auth';
import { Dialog, Paragraph, Button, Portal, PaperProvider, MD2DarkTheme } from 'react-native-paper';

import { locales } from '../../locales';


const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

const WatchedMovies = () => {
    const navigation = useNavigation();
    const [watchedMovies, setWatchedMovies] = useState([]);
    const user = auth().currentUser;
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});
    

   

   

    useEffect(() => {
        if (user) {
            fetchWatchedMovies(true);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchWatchedMovies(true);
            }
        }, [user])
    );

    const showAlert = (title, message, onConfirmAction) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setOnConfirm(() => onConfirmAction);
        setDialogVisible(true);
    };

    const fetchWatchedMovies = async (forceUpdate = false) => {
        if (!forceUpdate && watchedMovies.length > 0) return;

        try {
            const userWatchedSnapshot = await firestore().collection('users').doc(user.uid).collection('watched').get();
            const watchedMoviesIds = userWatchedSnapshot.docs.map(doc => doc.id);
            const watchedMovies = await fetchMoviesData(watchedMoviesIds);
            setWatchedMovies(watchedMovies.filter(movie => movie));
        } catch (error) {
            console.error('Error fetching watched movies:', error);
        }
    };

    const fetchMoviesData = async (movieIds) => {
        try {
            const moviesDataPromises = movieIds.map(async (movieId) => {
                const response = await axios.get(`${API_URL}/movie/${movieId}`, {
                    params: { api_key: API_KEY },
                });
                return response.data;
            });
            return await Promise.all(moviesDataPromises);
        } catch (error) {
            console.error('Error fetching movies data:', error);
            return [];
        }
    };

    const handleRemoveAll = () => {
        showAlert(
            'Remove All Watched Movies',
            'Are you sure you want to remove all watched movies?',
            () => removeAllWatchedMovies()
        );
    };

    const removeAllWatchedMovies = async () => {
        try {
            const userWatchedSnapshot = await firestore().collection('users').doc(user.uid).collection('watched').get();
            const batch = firestore().batch();

            userWatchedSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            setWatchedMovies([]);
            console.log('All watched movies removed successfully.');
        } catch (error) {
            console.error('Error removing watched movies:', error);
        }
    };

    const renderMovieItem = ({ item }) => {
        const title = item.title.length > 18 ? item.title.substring(0, 18) + "..." : item.title;
        return (
            <TouchableOpacity onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}>
                <View style={styles.movieContainer}>
                    <Image source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }} style={styles.moviePoster} />
                    <Text style={styles.movieTitle}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <PaperProvider theme={theme}>
            <ScrollView style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={IconImage} style={styles.backButtonIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{"Watched Movies"}</Text>
                <TouchableOpacity style={styles.removeAllButton} onPress={handleRemoveAll}>
                    <Text style={styles.removeAllText}>{'Remove All Watched Movies'}</Text>
                </TouchableOpacity>
                <View style={styles.scrollViewContent}>
                    {watchedMovies.map((movie) => renderMovieItem({ item: movie }))}
                </View>
            </ScrollView>
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
        marginBottom: 0,
    },
    backButton: {
        borderRadius: 5,
        position: 'absolute',
        top: hp(1),
        zIndex: 1,
    },
    backButtonIcon: {
        width: wp(7.656),
        height: wp(7),
    },
    scrollViewContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    movieContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#161618',
        borderRadius: 10,
        padding: 2,
    },
    moviePoster: {
        width: 175,
        height: 262.5,
        marginBottom: 5,
    },
    movieTitle: {
        color: 'white',
        marginTop: 5,
        textAlign: 'center',
    },
    removeAllButton: {
        backgroundColor: '#2c2c2c',
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 20,
        marginTop: 20,
        alignItems: 'center',
    },
    removeAllText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f3ce13',
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

export default WatchedMovies;
