import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, ActivityIndicator, Linking } from 'react-native';
import axios from 'axios';
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import { BannerAd, BannerAdSize,InterstitialAd, AdEventType,} from 'react-native-google-mobile-ads'; 

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { locales } from './locales';

import IconImage from './yellowback.png';

const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';







const Home = () => {
    const [popularMovies, setPopularMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [genres, setGenres] = useState([]);
    const [showBackButton, setShowBackButton] = useState(false);
    const [showCategories, setShowCategories] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [selectedGenreName, setSelectedGenreName] = useState('');
    const [pressedButton, setPressedButton] = useState(null);
    const [loading, setLoading] = useState(false); // Yükleme durumu için yeni state
    const [bannerKey, setBannerKey] = useState(0);
    const navigation = useNavigation();
    const [clickCount, setClickCount] = useState(0); 
    const [interstitialLoaded, setInterstitialLoaded] = useState(false);
    const interstitial = InterstitialAd.createForAdRequest("ca-app-pub-8053683961185907/2767866892");
    
    const user = auth().currentUser;
    
    

    


    useFocusEffect(
        React.useCallback(() => {
            
            fetchPopularMovies();
            fetchTopRatedMovies();
            fetchUpcomingMovies();
            fetchGenres();
    
             // Force re-fetch when the screen is focused
            
        }, [])
    );


    useEffect(() => {
       
        fetchPopularMovies();
        fetchTopRatedMovies();
        fetchUpcomingMovies();
        fetchGenres();

        
    }, []);

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
   

    

    const fetchPopularMovies = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/popular`, {
                params: {
                    api_key: API_KEY,
                    
                },
            });
            setPopularMovies(response.data.results);
        } catch (error) {
            console.error('Error fetching popular movies:', error);
        }
    };

    const fetchTopRatedMovies = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/top_rated`, {
                params: {
                    api_key: API_KEY,
                    
                },
            });
            setTopRatedMovies(response.data.results);
        } catch (error) {
            console.error('Error fetching top rated movies:', error);
        }
    };

    const fetchUpcomingMovies = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/upcoming`, {
                params: {
                    api_key: API_KEY,
                    
                },
            });
            setUpcomingMovies(response.data.results);
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await axios.get(`${API_URL}/genre/movie/list`, {
                params: {
                    api_key: API_KEY,
                    
                },
            });
            setGenres(response.data.genres);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const searchMovies = async () => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setShowBackButton(false);
            setShowCategories(true);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/search/movie`, {
                params: {
                    api_key: API_KEY,
                    query: searchQuery,
                    
                },
            });
            setSearchResults(response.data.results);
            setShowBackButton(true);
            setShowCategories(false);
        } catch (error) {
            console.error('Error searching movies:', error);
        }
    };

    const fetchMoviesByGenre = async (genreId, genreName) => {
        setLoading(true); // Yükleme durumunu başlat
        try {
            const response = await axios.get(`${API_URL}/discover/movie`, {
                params: {
                    api_key: API_KEY,
                    with_genres: genreId,
                    
                },
            });
            setSearchResults(response.data.results);
            setSelectedGenreName(genreName);
            setShowBackButton(true);
            setShowCategories(false);
            setShowOptions(false); // Kategoriler seçildikten sonra seçenekleri kapat
        } catch (error) {
            console.error('Error fetching movies by genre:', error);
        } finally {
            setLoading(false); // Yükleme durumunu bitir
        }
    };

    const handleBack = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedGenre(null);
        setSelectedGenreName('');
        setShowBackButton(false);
        setShowCategories(true);
    };

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const handleButtonPress = (buttonId, genreName = '') => {
        setPressedButton(buttonId);
        fetchMoviesByGenre(buttonId, genreName);
    };

    const renderMovieItem = ({ item, index }) => {
        const posterStyle = selectedGenreName ? styles.poster2 : styles.poster;

        if (index % 2 === 0) {
            return (
                <View style={styles.movieRow}>
                    <MovieItem item={item} posterStyle={posterStyle} />
                    {searchResults[index + 1] && <MovieItem item={searchResults[index + 1]} posterStyle={posterStyle} />}
                </View>
            );
        }
        return null;
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

    const MovieItem = ({ item }) => {
        const title = item.title.length > 18 ? item.title.substring(0, 18) + "..." : item.title;
        const posterStyle = selectedGenreName ? styles.poster2 : styles.poster;

        return (
            <TouchableOpacity onPress={() => handlePosterClick(item.id)}>
                <View style={styles.movieContainer}>
                    <Image source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }} style={posterStyle} />
                    <Text style={styles.movieTitle}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    };


   
    
    
    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <View style={styles.searchContainer}>
                    {showBackButton && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Image source={IconImage} style={styles.backButtonIcon} />
                        </TouchableOpacity>
                    )}
                    <TextInput
                        style={styles.searchInput}
                        placeholder={"Search movies..."}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={searchMovies}
                        placeholderTextColor="#888888"
                    />
                    <TouchableOpacity onPress={toggleOptions} style={styles.optionButton}>
                        <View style={styles.optionLine} />
                        <View style={styles.optionLine} />
                        <View style={styles.optionLine} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                {showCategories && (
                    <ScrollView>
                        <View>
                            <Text style={styles.categoryTitle}>{"Popular Movies"}</Text>
                            <FlatList
                                data={popularMovies}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderMovieItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                             <View style={styles.bannerAdContainer}>
    <BannerAd 
        
        size={"375x70"}
        unitId={"ca-app-pub-8053683961185907/6493341560"} 
        onAdFailedToLoad={(error) => console.error(error)}
    />
</View>
                            <Text style={styles.categoryTitle}>{"Top Rated Movies"}</Text>
                            <FlatList
                                data={topRatedMovies}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderMovieItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                             <View style={styles.bannerAdContainer}>
      <BannerAd 
      size={"375x70"}
      unitId={"ca-app-pub-8053683961185907/6493341560"} 
      onAdFailedToLoad={(error) => console.error(error)}/>
    </View>
                            <Text style={styles.categoryTitle}>{"Upcoming Movies"}</Text>
                            <FlatList
                                data={upcomingMovies}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderMovieItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                            <View style={styles.bannerAdContainer}>
      <BannerAd 
      size={"375x70"} 
      unitId={"ca-app-pub-8053683961185907/6493341560"} 
      onAdFailedToLoad={(error) => console.error(error)}/>
    </View>
                        </View>
                    </ScrollView>
                )}
                {selectedGenreName && (
                    <Text style={styles.genreHeader}>{selectedGenreName}</Text>
                )}
                {loading ? ( // Yükleme durumu
                    <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f3ce13" style={styles.loader} />
                    <Text style={styles.loadingText}>{"Loading..."}</Text>
                </View>
                ) : (
                    searchResults.length > 0 && (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderMovieItem}
                            style={styles.flatList}
                            contentContainerStyle={styles.searchResultsContainer}
                        />
                    )
                )}
            </View>
            {showOptions && (
                <View style={styles.optionsContainer}>
                    <ScrollView>
                        {genres.map((genre) => (
                            <TouchableOpacity
                                key={genre.id}
                                onPress={() => handleButtonPress(genre.id, genre.name)}
                                style={[
                                    styles.genreButton,
                                    pressedButton === genre.id && styles.pressedButton,
                                ]}
                            >
                                <Text style={styles.genreButtonText}>{genre.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            
            
        </View>
    );
};

const styles = StyleSheet.create({
    navContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#161618',
        padding: 10,
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161618',
        paddingVertical: 10,
    },
    topContainer: {
        marginBottom: 10,
    },
    bottomContainer: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'white',
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
    poster: {
        width: 150,
        height: 225,
        marginBottom: 5,
    },
    poster2: {
        width: 175,
        height: 262.5,
        marginBottom: 5,
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
        borderRadius: 5,
    },
    backButtonIcon: {
        width: 30,
        height: 30,
    },
    flatList: {
        flexGrow: 0,
    },
    navigationText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    optionButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLine: {
        width: 25,
        height: 3,
        backgroundColor: '#f3ce13',
        marginVertical: 2,
        borderRadius: 3,
    },
    optionsContainer: {
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: '#161618',
        borderRadius: 5,
        padding: 10,
        maxHeight: 530,
    },
    genreButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#2a2a2a',
        borderRadius: 5,
    },
    genreButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    pressedButton: {
        backgroundColor: '#555',
    },
    searchResultsContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    movieRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    movieTitle: {
        color: 'white',
        marginTop: 5,
        textAlign: 'center',
    },
    genreHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'white',
    },
    loader: {
        marginTop: 20,
    },
   
    bannerAdContainer: {
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '98%', // Full width
        marginBottom: 5, // Some space below the banner
            },
            loadingContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#161618',
            },
    loadingText: {
        marginTop: 10, // İsterseniz 'row' için 'marginLeft' kullanın
        fontSize: 16,
        color: '#f3ce13',
    },
});

export default Home;
