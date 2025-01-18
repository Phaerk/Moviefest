import React, { useState, useEffect, useRef  } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import IconImage from './yellowback.png';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFocusEffect } from '@react-navigation/native';



const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

const MovieDetailsScreen = ({ route }) => {
    const { movieId } = route.params;
    const navigation = useNavigation();
    const [movieDetails, setMovieDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatched, setIsWatched] = useState(false);
    const [selectedActor, setSelectedActor] = useState(null);
    const [showFullBio, setShowFullBio] = useState(false);
    const scrollViewRef = useRef(null); 
 
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
        
        fetchMovieDetails();
        fetchCast();
        if (user) {
            checkFavoriteStatus();
            checkWatchedStatus();
        }
    }, []);

    
    useFocusEffect(
        React.useCallback(() => {
            
            fetchMovieDetails();
        fetchCast();
        if (user) {
            checkFavoriteStatus();
            checkWatchedStatus();
        }
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
            }
        }, [])
    );



  


    const fetchMovieDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/${movieId}`, {
                params: {
                    api_key: API_KEY,
                   
                    append_to_response: 'videos',
                },
            });
            setMovieDetails(response.data);
        } catch (error) {
            console.error('Film detaylarını çekerken hata oluştu:', error);
        }
    };

    const fetchCast = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/${movieId}/credits`, {
                params: {
                    api_key: API_KEY,
                    
                },
            });
            setCast(response.data.cast);
        } catch (error) {
            console.error('Oyuncu bilgilerini çekerken hata oluştu:', error);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('favorites').doc(movieId.toString()).get();
            setIsFavorite(doc.exists);
        } catch (error) {
            console.error('Favori durumu kontrol edilirken hata oluştu:', error);
        }
    };

    const checkWatchedStatus = async () => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('watched').doc(movieId.toString()).get();
            setIsWatched(doc.exists);
        } catch (error) {
            console.error('İzledim durumu kontrol edilirken hata oluştu:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('favorites').doc(movieId.toString());

            if (isFavorite) {
                await movieDoc.delete();
            } else {
                await movieDoc.set({ movieId });
            }

            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Favori durumu değiştirilirken hata oluştu:', error);
        }
    };

    const toggleWatched = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('watched').doc(movieId.toString());

            if (isWatched) {
                await movieDoc.delete();
            } else {
                await movieDoc.set({ movieId });
            }

            setIsWatched(!isWatched);
        } catch (error) {
            console.error('İzledim durumu değiştirilirken hata oluştu:', error);
        }
    };

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
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } catch (error) {
            console.error('Oyuncu detaylarını çekerken hata oluştu:', error);
        }
    };

    const closeActorDetails = () => {
        setSelectedActor(null);
        setShowFullBio(false);
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

    const releaseYear = movieDetails.release_date.substring(0, 4);
    if (!isLoading) {
    return (
        <ScrollView ref={scrollViewRef} style={styles.container}>
        
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
                        <TouchableOpacity
                            key={actor.id}
                            style={styles.actorContainer}
                            onPress={() => showActorDetails(actor.id)}
                        >
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w200/${actor.profile_path}` }}
                                style={styles.actorImage}
                            />
                            <Text style={styles.actorName}>{actor.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
    
};
}

const styles = StyleSheet.create({
    picker: {
        width: wp(40),
        color: 'white',
        backgroundColor: '#161618',
    },
    container: {
        flex: 1,
        backgroundColor: '#161618',
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
    contentContainer: {
        paddingBottom: hp(2.56),
    },
    loadingText: {
        color: 'white',
        fontSize: wp(6.1),
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: hp(2.56),
        marginTop: hp(2.56),
    },
    posterFrame: {
        position: 'relative',
        borderWidth: wp(0.7656),
        borderRadius: wp(5.104),
        borderColor: '#f3ce13',
    },
    poster: {
        width: wp(63.8),
        height: hp(48),
        borderRadius: 10,
    },
    playContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: hp(0.64),
        paddingBottom: hp(1.28),
    },
    playButton: {
        backgroundColor: '#f3ce13',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.3),
        borderRadius: 5,
    },
    playText: {
        fontSize: wp(4.066),
        color: 'black',
        fontWeight: 'bold',
    },
    detailsContainer: {
        paddingHorizontal: wp(2.552),
    },
    title: {
        fontSize: wp(6.1),
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: hp(1.28),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: hp(1.28),
    },
    overview: {
        fontSize: wp(4.066),
        color: 'white',
        textAlign: 'justify',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161618',
        paddingHorizontal: wp(3.828),
        paddingVertical: hp(1.024),
        borderRadius: 5,
        marginRight: wp(2.552),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: wp(4),
    },
    castContainer: {
        marginTop: hp(2.56),
        paddingHorizontal: wp(2.552),
        marginBottom: hp(2),
    },
    castTitle: {
        fontSize: wp(5.083),
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: hp(1.28),
    },
    actorContainer: {
        marginRight: wp(2.552),
        alignItems: 'center',
    },
    actorImage: {
        width: wp(30.624),
        height: hp(23.04),
        borderRadius: 10,
    },
    actorName: {
        marginTop: hp(0.64),
        fontSize: wp(4.066),
        color: 'white',
        textAlign: 'center',
    },
    actorNameDetail: {
        fontSize: wp(6.1),
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: hp(1.28),
        alignSelf: 'center',
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

export default MovieDetailsScreen;

