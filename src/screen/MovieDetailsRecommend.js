import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import IconImage from './yellowback.png';
import NextButton from './nexty.png';
import BackButton from './assets/backy.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFocusEffect } from '@react-navigation/native';

import { locales } from './locales';



import { BannerAd, BannerAdSize, InterstitialAd, AdEventType, TestIds,RewardedAd,RewardedAdEventType } from 'react-native-google-mobile-ads'; 

const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

const MovieDetailsRecommend = ({ route }) => {
    const { movieId, movies } = route.params;
    const navigation = useNavigation();
    const [movieDetails, setMovieDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatched, setIsWatched] = useState(false);
    const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
    const [opacity] = useState(new Animated.Value(1)); // Opacity animation value
    const scrollViewRef = useRef(null); // Ref for ScrollView
    const [interstitialLoaded, setInterstitialLoaded] = useState(false);

    const [selectedActor, setSelectedActor] = useState(null);
    const [showFullBio, setShowFullBio] = useState(false);
    const [showNavBar, setShowNavBar] = useState(true);

    const interstitial = InterstitialAd.createForAdRequest("ca-app-pub-8053683961185907/2767866892");


    const [isLoading, setIsLoading] = useState(true);

    const auth = getAuth();
    const user = auth.currentUser;
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!movieDetails ) {
                setIsLoading(true);
            }else{setIsLoading(false);}
        }, 0); // Burada 2000 milisaniye = 2 saniye

        // Temizleme işlevi
        return () => clearTimeout(timer);
    }, [movieDetails]);

    



   

    useEffect(() => {
        
        fetchMovieDetails(movieId);
        fetchCast(movieId);
        if (user) {
            checkFavoriteStatus(movieId);
            checkWatchedStatus(movieId);
        }
    }, []);

    useEffect(() => {
        // Scroll to top whenever currentMovieIndex changes
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    }, [currentMovieIndex]);

    useFocusEffect(
        React.useCallback(() => {
            fetchMovieDetails(movieId);
        fetchCast(movieId);
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
            }
        }, [])
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
   


    const fetchMovieDetails = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/movie/${id}`, {
                params: {
                    api_key: API_KEY,
                    append_to_response: 'videos',
                    
                },
            });
            setMovieDetails(response.data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    };

    const fetchCast = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/movie/${id}/credits`, {
                params: {
                    api_key: API_KEY,
                   
                },
            });
            setCast(response.data.cast);
        } catch (error) {
            console.error('Error fetching cast:', error);
        }
    };

    const checkFavoriteStatus = async (id) => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('favorites').doc(id.toString()).get();
            setIsFavorite(doc.exists);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const checkWatchedStatus = async (id) => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('watched').doc(id.toString()).get();
            setIsWatched(doc.exists);
        } catch (error) {
            console.error('Error checking watched status:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('favorites').doc(movies[currentMovieIndex].id.toString());

            if (isFavorite) {
                await movieDoc.delete();
                setIsFavorite(false); // Toggle edildiğinde durumu false yap
            } else {
                await movieDoc.set({ movieId: movies[currentMovieIndex].id }); // Doğru film kimliğini kullan
                setIsFavorite(true); // Toggle edildiğinde durumu true yap
            }
        } catch (error) {
            console.error('Error toggling favorite status:', error);
        }
    };

    const toggleWatched = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('watched').doc(movies[currentMovieIndex].id.toString());

            if (isWatched) {
                await movieDoc.delete();
                setIsWatched(false); // Toggle edildiğinde durumu false yap
            } else {
                await movieDoc.set({ movieId: movies[currentMovieIndex].id }); // Doğru film kimliğini kullan
                setIsWatched(true); // Toggle edildiğinde durumu true yap
            }
        } catch (error) {
            console.error('Error toggling watched status:', error);
        }
    };

    const shouldShowAd = () => {
        // Show ad every 3 movies, for example
        return movieWatchedCount % 4 === 0;
    };
    const [movieWatchedCount, setMovieWatchedCount] = useState(0);
    const handleNextMovie = () => {
        if (shouldShowAd()) {
            showAd();
            
        }
        if (currentMovieIndex < movies.length - 1) {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setCurrentMovieIndex(currentMovieIndex + 1);
                setMovieWatchedCount(movieWatchedCount + 1);
                fetchMovieDetails(movies[currentMovieIndex + 1].id);
                fetchCast(movies[currentMovieIndex + 1].id);
                if (user) {
                    checkFavoriteStatus(movies[currentMovieIndex + 1].id);
                    checkWatchedStatus(movies[currentMovieIndex + 1].id);
                }
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }
    };

    const handleBackMovie = () => {
        if (currentMovieIndex > 0) {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setCurrentMovieIndex(currentMovieIndex - 1);
                fetchMovieDetails(movies[currentMovieIndex - 1].id);
                fetchCast(movies[currentMovieIndex - 1].id);
                if (user) {
                    checkFavoriteStatus(movies[currentMovieIndex - 1].id);
                    checkWatchedStatus(movies[currentMovieIndex - 1].id);
                }
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }
    };

    const releaseYear = movieDetails ? movieDetails.release_date.substring(0, 4) : '';

    const showActorDetails = async (actorId) => {
        try {
            const response = await axios.get(`${API_URL}/person/${actorId}`, {
                params: {
                    api_key: API_KEY,
                  
                },
            });

            const movieCreditsResponse = await axios.get(`${API_URL}/person/${actorId}/movie_credits`, {
                params: {
                    api_key: API_KEY,
                   
                },
            });

            const shortenedMovieCredits = movieCreditsResponse.data.cast.map(item => ({
                ...item,
                title: item.title.length > 16 ? item.title.substring(0, 16) + "..." : item.title
            }));

            setSelectedActor({
                ...response.data,
                age: calculateAge(response.data.birthday),
                movieCredits: shortenedMovieCredits,
            });

            setShowNavBar(false);

            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } catch (error) {
            console.error('Oyuncu detaylarını çekerken hata oluştu:', error);
        }
    };

    const closeActorDetails = () => {
        setSelectedActor(null);
        setShowFullBio(false);

        setShowNavBar(true);
    };

    const toggleBio = () => {
        setShowFullBio(!showFullBio);
    };

    const calculateAge = (birthday) => {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color="#f3ce13" />
           </View>)
   }

    return (
        <View style={styles.container}>
            <Animated.ScrollView ref={scrollViewRef} style={{ opacity }}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={IconImage} style={styles.backButtonIcon} />
                </TouchableOpacity>
                <View style={styles.contentContainer}>
                    <View style={styles.imageContainer}>
                        <View style={styles.posterFrame}>
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}` }}
                                style={styles.poster}
                            />
                        </View>
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.title}>{movieDetails.title} ({releaseYear})</Text>
                        <View style={styles.ratingContainer}>
                            <View style={styles.playContainer}>
                                <TouchableOpacity style={styles.playButton}>
                                    <Text style={styles.playText}>{'IMDB '}{movieDetails.vote_average.toFixed(1)}</Text>
                                </TouchableOpacity>
                                <View style={styles.actionButtonsContainer}>
                                    <TouchableOpacity onPress={toggleFavorite} style={styles.actionButton}>
                                        <Image source={isFavorite ? require('./liked.png') : require('./like.png')} style={styles.icon} />
                                        <Text style={styles.favText}>{isFavorite ? 'Liked' : 'Like'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={toggleWatched} style={styles.actionButton}>
                                        <Image source={isWatched ? require('./watched_icon.png') : require('./unwatched_icon.png')} style={styles.icon} />
                                        <Text style={styles.favText}>{isWatched ? 'Watched' : 'Unwatched'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.overview}>{movieDetails.overview}</Text>
                    </View>
                </View>
                <View style={styles.castContainer}>
                    <Text style={styles.castTitle}>{'Cast'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {cast.map(actor => (
                            <TouchableOpacity key={actor.id} onPress={() => showActorDetails(actor.id)} style={styles.actorContainer}>
                                <Image
                                    source={{ uri: `https://image.tmdb.org/t/p/w200/${actor.profile_path}` }}
                                    style={styles.actorImage}
                                />
                                <Text style={styles.actorName}>{actor.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                {/* Actor Details Modal */}
                {selectedActor && (
                <View style={styles.actorDetailsContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeActorDetails}>
                        <Text style={styles.closeButtonText}>{'Close'}</Text>
                    </TouchableOpacity>
                    <View style={styles.actorInfo}>
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w200/${selectedActor.profile_path}` }}
                            style={styles.actorProfileImage}
                        />
                        <Text style={styles.actorNameDetail}>
                            {selectedActor.name} ({selectedActor.age})
                        </Text>
                        <Text
                            style={styles.actorBio}
                            numberOfLines={showFullBio ? 12 : 3}
                        >
                            {selectedActor.biography}
                        </Text>
                        {selectedActor.biography && selectedActor.biography.length > 100 && (
                            <TouchableOpacity onPress={toggleBio}>
                                <Text style={styles.readMoreText}>{showFullBio ? 'Read Less' : 'Read More'}</Text>
                            </TouchableOpacity>
                        )}
                        <View style={styles.actorDetails}>
                            <Text> 
                                <Text style={styles.actorDetailText}>{'Born: '}</Text>
                                <Text style={styles.birthdayText}>{selectedActor.birthday || '-'}</Text>
                            </Text>

                            <Text> 
                                <Text style={styles.actorDetailText}>{'Place of Birth: '}</Text>
                                <Text style={styles.birthdayText}>{selectedActor.place_of_birth || '-'}</Text>
                            </Text>

                            
                        </View>
                        <FlatList
                            horizontal
                            data={selectedActor.movieCredits}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => navigation.push('MovieDetails', { movieId: item.id })}
                                    style={styles.movieCreditItem}
                                >
                                    <Image
                                        source={{ uri: `https://image.tmdb.org/t/p/w200/${item.poster_path}` }}
                                        style={styles.moviePoster}
                                    />
                                    <Text style={styles.movieTitle}>{item.title}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
                )}
            </Animated.ScrollView>
            {showNavBar && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.navButton, currentMovieIndex === 0 && styles.disabledButton]}
                        onPress={handleBackMovie}
                        disabled={currentMovieIndex === 0}
                    >
                        <Image source={BackButton} style={styles.NextButtonIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navButton, currentMovieIndex === movies.length - 1 && styles.disabledButton]}
                        onPress={handleNextMovie}
                        disabled={currentMovieIndex === movies.length - 1}
                    >
                        <Image source={NextButton} style={styles.NextButtonIcon} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161618',
    },
    backButton: {
        padding: 5,
        borderRadius: 5,
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    backButtonIcon: {
        width: 30,
        height: 30,
    },
    NextButtonIcon: {
        width: 45,
        height: 45,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    posterFrame: {
        position: 'relative',
        borderWidth: 3,
        borderRadius: 20,
        borderColor: '#f3ce13',
    },
    poster: {
        width: 250,
        height: 375,
        borderRadius: 10,
    },
    playContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 10,
    },
    playButton: {
        backgroundColor: '#f3ce13',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    playText: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
    },
    detailsContainer: {
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
    },
    overview: {
        fontSize: 16,
        color: 'white',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'right',
        backgroundColor: '#161618',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginRight: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align buttons to the right side
        marginTop: 10,
        paddingHorizontal: 10,
    },
    castContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    castTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
    actorContainer: {
        marginRight: 10,
        alignItems: 'center',
    },
    actorImage: {
        width: 120,
        height: 180,
        borderRadius: 10,
    },
    actorName: {
        marginTop: 5,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    favText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
    navButton: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderRadius: 10,
    },
    navButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 9,
        paddingVertical: 10,
    },
    disabledButton: {
        backgroundColor: 'gray',
    },
    actorDetailsContainer: {
        paddingTop: hp(2),
        paddingHorizontal: 2,
        backgroundColor: '#161618',
        position: 'absolute',
        top: 0,
        left: 8,
        right: 8,
        bottom: 0,
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: hp(2.56),
        right: wp(2),
        padding: wp(2),
    },
    closeButtonText: {
        color: '#f3ce13',
        fontSize: wp(4.066),
        fontWeight: 'bold',
    },
    actorInfo: {
        alignItems: 'left',
    },
    actorProfileImage: {
        width: wp(50),
        height: wp(75),
        borderRadius: 10,
        marginBottom: hp(3),
        alignSelf: 'center',
    },
    movieCreditsContainer: {
        maxHeight: hp(40),
        marginTop: hp(2),
    },
    movieCreditItem: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#161618',
        borderRadius: 10,
        padding: 2,
        marginRight: 0,
    },
    moviePoster: {
        width: 160,
        height: 225,
        marginBottom:5,
    },
    movieTitle: {
        marginTop: 5,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    movieCharacter: {
        fontSize: wp(3.555),
        color: 'white',
    },
    favText: {
        fontSize: wp(3.05),
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: hp(1.28),
    },
    actorBio: {
        fontSize: wp(3.555),
        color: 'white',
        textAlign: 'justify',
        marginBottom: hp(1.28),
    },
    readMoreText: {
        fontSize: wp(3.555),
        color: '#f3ce13',
        alignSelf: 'center',
    },
    actorDetails: {
        marginTop: hp(4),
        marginBottom: hp(4),
        alignItems: 'flex-start',
    },
    actorDetailText: {
        fontSize: wp(3.8),
        color: '#f3ce13',
        marginBottom: hp(0.64),
        textAlign: 'left',
    },
    birthdayText: {
        fontSize: wp(3.8),
        color: 'white',
        marginBottom: hp(0.64),
        textAlign: 'left',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161618',
    },
});

export default MovieDetailsRecommend;