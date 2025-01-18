import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Platform, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import IconImage from './settings5.png';
import IconImage2 from './settings6.png';
import { Auth } from '../../services';
import { Dialog, Paragraph, Button, Portal, PaperProvider, MD2DarkTheme } from 'react-native-paper';
import {BannerAd,InterstitialAd, AdEventType,} from 'react-native-google-mobile-ads'; 

import profile from './profile_.png';
import { locales } from '../locales';




const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState(null);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [name, setName] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});
    const [interstitialLoaded, setInterstitialLoaded] = useState(false);
    const interstitial = InterstitialAd.createForAdRequest("ca-app-pub-8053683961185907/2767866892");
    const [clickCount, setClickCount] = useState(0); 

    const user = auth().currentUser;
    const imageSource = profileImageUrl ? { uri: profileImageUrl } : profile;

  


    useEffect(() => {
        if (user) {
           
            fetchUserProfile();
            fetchFavoriteMovies(true);
            fetchWatchedMovies(true);
            
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (user) {
             
                fetchUserProfile(); // User profile re-fetch when the screen is focused
                fetchFavoriteMovies(true); // Force re-fetch when the screen is focused
                fetchWatchedMovies(true); 
                 // Force re-fetch when the screen is focused
                
            }
        }, [user])
    );

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(
            AdEventType.LOADED,
            () => {
                setInterstitialLoaded(true);
            }
        );
    
        const unsubscribeFailed = interstitial.addAdEventListener(
            AdEventType.ERROR,
            (error) => {
                console.error('Interstitial ad failed to load:', error);
            }
        );
    
        const unsubscribeClosed = interstitial.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setInterstitialLoaded(false);
                interstitial.load(); // Load the ad again for future use
            }
        );
    
        interstitial.load();
    
        return () => {
            unsubscribeLoaded();
            unsubscribeFailed();
            unsubscribeClosed();
        };
    }, []);

    

    const showAd = () => {
        const interstitial= InterstitialAd.createForAdRequest("ca-app-pub-8053683961185907/2767866892", {
            requestNonPersonalizedAdsOnly: true,
            keywords: ['film', 'movie'],
        });
    
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            interstitial.show();
        });
    
        const unsubscribeEarned = interstitial.addAdEventListener(
            AdEventType.CLOSED,
            interstitial => {
                console.log("Callback called!");
            },
        );
    
        interstitial.load();
    }

    const showAlert = (title, message, onConfirmAction) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setOnConfirm(() => onConfirmAction);
        setDialogVisible(true);
    };

    const fetchUserProfile = async () => {
        try {
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                setUserProfile(userData);
                setName(userData.name);
                setProfileImageUrl(userData.profileImageUrl || '');
            } else {
                // Eğer kullanıcı Google ile giriş yapmışsa, bilgileri Google'dan al
                if (user.providerData[0].providerId === 'google.com') {
                    const googleProfile = {
                        name: user.displayName,
                        profileImageUrl: user.photoURL,
                    };
                    setUserProfile(googleProfile);
                    setName(googleProfile.name);
                    setProfileImageUrl(googleProfile.profileImageUrl);
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavoriteMovies = async (forceUpdate = false) => {
        if (!forceUpdate && favoriteMovies.length > 0) return; // Avoid re-fetching if not necessary

        try {
            const userFavoritesSnapshot = await firestore().collection('users').doc(user.uid).collection('favorites').get();
            const favoriteMoviesIds = userFavoritesSnapshot.docs.map(doc => doc.id); // Get only movie IDs
            const favoriteMovies = await fetchMoviesData(favoriteMoviesIds); // Fetch movie details from API
            setFavoriteMovies(favoriteMovies.filter(movie => movie)); // Filter out null values
        } catch (error) {
            console.error('Error fetching favorite movies:', error);
        }
    };

    const fetchWatchedMovies = async (forceUpdate = false) => {
        if (!forceUpdate && watchedMovies.length > 0) return; // Avoid re-fetching if not necessary

        try {
            const userWatchedSnapshot = await firestore().collection('users').doc(user.uid).collection('watched').get();
            const watchedMoviesIds = userWatchedSnapshot.docs.map(doc => doc.id); // Get only movie IDs
            const watchedMovies = await fetchMoviesData(watchedMoviesIds); // Fetch movie details from API
            setWatchedMovies(watchedMovies.filter(movie => movie)); // Filter out null values
        } catch (error) {
            console.error('Error fetching watched movies:', error);
        }
    };

    const fetchMoviesData = async (movieIds) => {
        try {
            const moviesDataPromises = movieIds.map(async (movieId) => {
                const response = await axios.get(`${API_URL}/movie/${movieId}`, {
                    params: {
                        api_key: API_KEY,
                      
                    },
                });
                return response.data;
            });
            const moviesData = await Promise.all(moviesDataPromises);
            return moviesData;
        } catch (error) {
            console.error('Error fetching movies data:', error);
            return [];
        }
    };

    const handleImagePicker = () => {
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

    const uploadImage = async (uri) => {
        setLoading(true);
        const storageRef = storage().ref(`profile_pictures/${user.uid}`);
        try {
            await storageRef.putFile(uri);
            const url = await storageRef.getDownloadURL();
            await firestore().collection('users').doc(user.uid).update({ profileImageUrl: url });
            setProfileImageUrl(url);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavoriteMovie = async (movieId) => {
        setFavoriteMovies((prevMovies) => prevMovies.filter(movie => movie.id !== movieId)); // Optimistic update

        try {
            await firestore().collection('users').doc(user.uid).collection('favorites').doc(movieId).delete();
        } catch (error) {
            console.error('Error removing favorite movie:', error);
            // Optionally, you can revert the state update if the API call fails
            fetchFavoriteMovies(true);
        }
    };

    const removeWatchedMovie = async (movieId) => {
        setWatchedMovies((prevMovies) => prevMovies.filter(movie => movie.id !== movieId)); // Optimistic update

        try {
            await firestore().collection('users').doc(user.uid).collection('watched').doc(movieId).delete();
        } catch (error) {
            console.error('Error removing watched movie:', error);
            // Optionally, you can revert the state update if the API call fails
            fetchWatchedMovies(true);
        }
    };

    const renderMovieItem = ({ item, onRemove }) => {
        const title = item.title.length > 18 ? item.title.substring(0, 18) + "..." : item.title;
        return (
            <TouchableOpacity onPress={() => handlePosterClick(item.id)}>
                <View style={styles.movieContainer}>
                    <Image source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }} style={styles.moviePoster} />
                    <Text style={styles.movieTitle}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const handlePosterClick = (item) => {
        setClickCount((prevCount) => prevCount + 1); // Tıklama sayısını artır

        // Eğer tıklama sayısı 4'ün katıysa true döner, değilse false döner.
        const isFourthClick = (clickCount + 1) % 4 === 0;
        if (isFourthClick) {
            showAd();
        }

        navigation.navigate('MovieDetails', { movieId: item });
    };


    const showLogoutAlert = () => {
        // Check if user exists before accessing properties
        if (user) {
            showAlert("Log Out", "Are you sure you want to log out?", () => Auth.signOut());
        } else {
            console.error('No user is currently signed in');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f3ce13" />
            </View>
        );
    }

    return (
        <PaperProvider theme={theme}>
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                <Image source={IconImage} style={styles.settingsButtonIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButtonRight} onPress={showLogoutAlert}>
                <Image source={IconImage2} style={styles.backButtonIcon} />
            </TouchableOpacity>
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={handleImagePicker}>
                <Image 
            source={imageSource} 
            style={styles.profileImage} 
        />
                </TouchableOpacity>
                <Text style={styles.profileName}>{name}</Text>
            </View>
            <View style={styles.bannerAdContainer}>
    <BannerAd 
        
        size={"375x70"}
        unitId={"ca-app-pub-8053683961185907/6493341560"} 
        
    />
</View>
            <Text style={styles.sectionTitle}>{'Liked Movies'}</Text>
            {favoriteMovies.length === 0 ? (
                <Text style={styles.noMoviesText}>{'No liked movies added yet.'}</Text>
            ) : (
            <FlatList
                data={favoriteMovies}
                renderItem={(item) => renderMovieItem(item, removeFavoriteMovie)}
                keyExtractor={(item) => item.id.toString()}
                horizontal
            />  )}
             <View style={styles.bannerAdContainer}>
    <BannerAd 
        
        size={"375x70"}
        unitId={"ca-app-pub-8053683961185907/6493341560"} 
        onAdFailedToLoad={(error) => console.error(error)}
        
    />
</View>
             <Text style={styles.sectionTitle}>{'Watched Movies'}</Text>
            {watchedMovies.length === 0 ? (
                <Text style={styles.noMoviesText}>{'No watched movies added yet.'}</Text>
            ) : (
            <FlatList
                data={watchedMovies}
                renderItem={(item) => renderMovieItem(item, removeWatchedMovie)}
                keyExtractor={(item) => item.id.toString()}
                horizontal
            />)}
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
            <View height={10}></View>
        </ScrollView>
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
        backgroundColor: '#161618',
        padding: 10,
        
    },
    settingsButton: {
        padding: 5,
        borderRadius: 5,
        position: 'absolute',
        top: 20,
        left: 0,
        zIndex: 1,
    },
    backButtonRight: {
        padding: 5,
        borderRadius: 5,
        position: 'absolute',
        top: 20,
        right: 0,
        zIndex: 1,
    },
    backButtonIcon: {
        width: 30,
        height: 30,
    },
    settingsButtonIcon: {
        width: 40,
        height: 40,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
        position: 'relative',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
        position: 'relative',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    addPhotoText: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
        backgroundColor: '#161618',
        borderRadius: 12,
        padding: 5,
        textAlign: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginTop: 10,
    },
    section: {
        marginBottom: 20,
        marginLeft: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
    noMoviesText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'left',
        marginTop: 5,
        marginBottom:10,
    },
    movieContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: '#161618',
        borderRadius: 10,
        padding: 2,
        marginRight: 0,
    },
    moviePoster: {
        width: 150,
        height: 225,
        marginBottom: 5,
    },
    movieTitle: {
        marginTop: 5,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    removeFavorite: {
        color: 'red',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161618',
    },
    loadingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 5, // Yeni eklenen stil, logout butonunun üst boşluğu
        alignSelf: 'center', // Butonun ortalanması için
        marginBottom:20,
    },
    logoutButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    bannerAdContainer: {
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '98%', // Full width
        marginBottom: 5, // Some space below the banner
            },
});

export default ProfileScreen;