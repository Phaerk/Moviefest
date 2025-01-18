import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,ActivityIndicator, } from 'react-native';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { BannerAd, BannerAdSize} from 'react-native-google-mobile-ads'; 
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

import IconImage from './recommendback.png'; 

import { locales } from './locales';

const RecommendationPage = () => {
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedStartYear, setSelectedStartYear] = useState(null);
    const [selectedEndYear, setSelectedEndYear] = useState(null);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const navigation = useNavigation();
    
    const user = auth().currentUser;


    

   

   


    useFocusEffect(
        React.useCallback(() => {
            
            
            fetchGenres();
    
             // Force re-fetch when the screen is focused
            
        }, [])
    );


    useEffect(() => {
        
        fetchGenres();

        
    }, []);

    

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

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre.id)) {
            setSelectedGenres(selectedGenres.filter((selectedGenre) => selectedGenre !== genre.id));
        } else {
            setSelectedGenres([...selectedGenres, genre.id]);
        }
    };

    const recommendMovies = async () => {
        if (!selectedStartYear || !selectedEndYear) {
            alert('Please select both start and end years.');
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/discover/movie`, {
                params: {
                    api_key: API_KEY,
                    
                    with_genres: selectedGenres.join(','),
                    'primary_release_date.gte': `${selectedStartYear}-01-01`,
                    'primary_release_date.lte': `${selectedEndYear}-12-31`,
                    sort_by: 'popularity.desc',
                },
            });

            const filteredMovies = response.data.results.filter(movie => movie.vote_average < 10);
            setRecommendedMovies(filteredMovies);

            if (filteredMovies.length > 0) {
                navigation.navigate('MovieDetailsRecommend', { movieId: filteredMovies[0].id, movies: filteredMovies });
            } else {
                alert('No movies found for the selected criteria');
            }
        } catch (error) {
            console.error('Error fetching recommended movies:', error);
        }
    };

   
     return (
        <View style={styles.container}>
            <View style={styles.navigationBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={IconImage} style={styles.backButtonIcon} />
                </TouchableOpacity>
                <Text style={styles.navigationText}>{"Recommend Me A Film"}</Text>
            </View>
            <ScrollView style={styles.scrollView}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{"Select Genres"}</Text>
                    <View style={styles.genreContainer}>
                        {genres.map((genre, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.genreButton,
                                    selectedGenres.includes(genre.id) && styles.genreButtonSelected,
                                ]}
                                onStartShouldSetResponder={() => toggleGenre(genre)}
                            >
                                <Text style={styles.genreButtonText}>{genre.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{"Select Year Range"}</Text>
                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedStartYear}
                                onValueChange={(itemValue) => setSelectedStartYear(itemValue)}
                                style={styles.yearPicker}
                            >
                                <Picker.Item label={"Select Start Year"} value={null} />
                                {Array.from({ length: 2024 - 1970 + 1 }, (_, i) => 1970 + i).map((year) => (
                                    <Picker.Item key={year} label={`${year}`} value={year} />
                                ))}
                            </Picker>
                        </View>
                        <View style={[styles.pickerWrapper, styles.rightPickerWrapper]}>
                            <Picker
                                selectedValue={selectedEndYear}
                                onValueChange={(itemValue) => setSelectedEndYear(itemValue)}
                                style={styles.yearPicker}
                            >
                                <Picker.Item label={"Select End Year"} value={null} />
                                {Array.from({ length: 2024 - 1970 + 1 }, (_, i) => 2024 - i).map((year) => (
                                    <Picker.Item key={year} label={`${year}`} value={year} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.bannerAdContainer}>
                        <BannerAd
                            size={"375x70"}
                            unitId={"ca-app-pub-8053683961185907/6493341560"}
                            onAdFailedToLoad={(error) => console.error(error)}
                        />
                    </View>
                </View>
                <TouchableOpacity style={styles.recommendButton} onPress={recommendMovies}>
                    <Text style={styles.recommendButtonText}>{"Recommend"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161618',
        padding: 10,
    },
     header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    scrollView: {
        marginBottom: 5, // Adjusted to accommodate recommendButton
    },
    section: {
        marginBottom: 0,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    genreContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    genreButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f3ce13',
        borderRadius: 20,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    genreButtonSelected: {
        backgroundColor: '#fff',
    },
    genreButtonText: {
        color: 'black',
        fontWeight: 'bold',
    },
    recommendButton: {
        backgroundColor: '#f3ce13',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30, // Adjusted from 120 to 20
    },
    recommendButtonText: {
        color: 'black',
        fontWeight: 'bold',
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    pickerWrapper: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 10, // Add right margin for spacing between pickers
    },
    rightPickerWrapper: {
        marginRight: 0, // Remove right margin for the last picker
    },
    yearPicker: {
        backgroundColor: '#f3ce13',
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    pickerItemStyle: {
        height: 30, // Adjust the height of each item in the dropdown list
    },    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
        color:'black',
    },
    backButton: {
        left:10,
        position: 'absolute',
         
    },
    backButtonIcon: {
        width: 25,
        height: 25,
    },
    navigationText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3ce13',
        height: 50,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginBottom:10,
        
    },
    bannerAdContainer: {
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '98%', // Full width
         
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161618',
    },       
});

export default RecommendationPage;