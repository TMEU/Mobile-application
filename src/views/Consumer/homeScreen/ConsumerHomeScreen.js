/* eslint-disable arrow-body-style */
import axios from "axios";
import React, {useEffect, useContext, useState} from "react";
import {ScrollView, TouchableOpacity, StyleSheet, View, Text, SafeAreaView} from "react-native";
import {Searchbar, ActivityIndicator, Button} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AuthContext from "../../../context/auth-context";
import * as Colors from "../../../styles/abstracts/colors";
import AppHeader from "../../Common/AppHeader";
import {HOST_PORT} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GigRow from "./components/GigRow";
import GigGrid from "./components/GigGrid";
import Filters from "./components/Filters";

export const ConsumerHomeScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [emptyResult, setEmptyResult] = useState(false);
  const [refresh, setRefresh] = useState(1);
  const [gigs, setGigs] = useState([]);
  const [vegetableGigs, setVegetableGigs] = useState([]);
  const [fruitGigs, setFruitGigs] = useState([]);
  const [mylocation, setMyLocation] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showFilters, setshowFilters] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [searchResult, setSearchResult] = useState(false);
  const [searchTxt, setSearchTxt] = useState("carrot");

  // Prams states
  const [category, setCategory] = useState("vegetable");
  const [gigType, setGigType] = useState("post");
  const [distance, setDistance] = useState("200000");
  const [lt, setLt] = useState("1000");
  const [gt, setGt] = useState("100");
  const [unit, setUnit] = useState("");
  const [deliverability, setDeliverability] = useState("");
  const [sortby, setSortBy] = useState("");

  const {loginState} = useContext(AuthContext);
  const jwt = loginState.userToken;

  const handleSortby = val => {
    setSortBy(val);
  };

  const handleDeliveryAbility = value => {
    setDeliverability(value);
  };

  const handleUnit = val => {
    setUnit(val);
  };

  const handleDistance = value => {
    setDistance(value);
  };

  const handleLt = val => {
    setLt(val);
  };

  const handleGt = val => {
    setGt(val);
  };

  const handleGigType = value => {
    setGigType(value);
  };

  const handleCategory = value => {
    setCategory(value);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  const toggleSetshowFilters = () => {
    setshowFilters(!showFilters);
  };

  const applyFilters = () => {
    setSearchResult(false);
    setshowFilters(false);
    setRefresh(refresh + 1);
    setShowResult(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchResult(false);
    setshowFilters(false);
    setShowResult(false);
    setSearchTxt(false);
    setRefresh(1);
    setPage(1);
    setSortBy("");
  };

  const closeSearch = () => {
    setSearchResult(false);
    setRefresh(1);
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    } else {
      alert("You are already on first page");
    }
  };

  // search
  const handleSearch = txt => {
    // setSearchTxt(txt);
    setShowResult(true);
    setSearchResult(true);
    console.log("submit", txt);
    setRefresh(refresh + 1);
  };

  // get location
  useEffect(() => {
    const getMyLocation = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("mylocation");
        if (jsonValue != null) {
          const obj = JSON.parse(jsonValue);
          setMyLocation(obj);
        } else {
          console.log("app loction null");
        }
      } catch (e) {
        console.error(e);
      }
    };
    getMyLocation();
  }, []);

  // Get mixed gigs
  useEffect(() => {
    async function getGigs() {
      setLoading(true);
      setEmptyResult(false);

      let response;
      try {
        if (showResult) {
          if (searchResult) {
            response = await axios({
              method: "get",
              url: `${HOST_PORT}/api/v1/gigs/search/${searchTxt}`,
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
          } else {
            response = await axios({
              method: "get",
              url: `${HOST_PORT}/api/v1/gigs/all/${mylocation.latitude},${mylocation.longitude}?limit=${limit}&distance=${distance}&page=${page}&gigCategory=${category}&gigType=${gigType}&unitPrice[gte]=${gt}&unitPrice[lte]=${lt}&unit=${unit}&deliveryAbility=${deliverability}&sort=${sortby}`,
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
          }
        } else {
          response = await axios({
            method: "get",
            url: `${HOST_PORT}/api/v1/gigs/all/${mylocation.latitude},${mylocation.longitude}?limit=${limit}&distance=200000&page=${page}`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
        }
        setGigs(response.data.data.gigs);
        setLoading(false);
      } catch (error) {
        // const {message} = error.response.data;
        if (error.response.data.status === "fail") {
          setEmptyResult(true);
          setLoading(false);
          // setShowResult(false);
          // console.error(error);
          console.log(error.response.data);
        }
      }
    }
    getGigs();
  }, [limit, page, refresh]);

  // get vege gigs
  useEffect(() => {
    async function getGigs() {
      try {
        const response = await axios({
          method: "get",
          url: `${HOST_PORT}/api/v1/gigs/all/${mylocation.latitude},${mylocation.longitude}?limit=${limit}&distance=200000&gigCategory=vegetable`,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setVegetableGigs(response.data.data.gigs);
      } catch (error) {
        console.error(error);
      }
    }
    getGigs();
  }, []);

  // get fruit gigs
  useEffect(() => {
    async function getGigs() {
      try {
        const response = await axios({
          method: "get",
          url: `${HOST_PORT}/api/v1/gigs/all/5.977553814423967,80.34890374890934?limit=${limit}&distance=60000&gigCategory=fruit`,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setFruitGigs(response.data.data.gigs);
      } catch (error) {
        // prevPage();
        console.error(error);
      }
    }
    getGigs();
  }, []);

  return (
    <SafeAreaView>
      <AppHeader navigation={navigation} title="Gigs" />
      <View style={styles.searchbarContainer}>
        <Searchbar
          style={styles.searchbarLeft}
          onChangeText={txt => setSearchTxt(txt)}
          onSubmitEditing={e => handleSearch(e.nativeEvent.text)}
          placeholder="Search"
          value={searchTxt}
        />
        <TouchableOpacity style={styles.searchbarRight} onPress={() => toggleSetshowFilters()}>
          <MaterialCommunityIcons name="tune" color="#fff" size={30} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll}>
        <Filters
          showFilters={showFilters}
          toggleModal={toggleSetshowFilters}
          showResult={showResult}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
          category={category}
          handleCategory={handleCategory}
          gigType={gigType}
          handleGigType={handleGigType}
          gt={gt}
          handleGt={handleGt}
          lt={lt}
          handleLt={handleLt}
          distance={distance}
          handleDistance={handleDistance}
          unit={unit}
          handleUnit={handleUnit}
          deliverability={deliverability}
          handleDeliveryAbility={handleDeliveryAbility}
          sortby={sortby}
          handleSortby={handleSortby}
        />

        <View style={styles.container}>
          {!showResult && <GigRow gigs={fruitGigs} title="Fruits" />}

          {!showResult && <GigRow gigs={vegetableGigs} title="Vegetables" />}

          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator animating={true} />
            </View>
          )}

          {!loading && !emptyResult && (
            <GigGrid
              gigs={gigs}
              title={showResult ? "Result" : "You may like"}
              nextPage={nextPage}
              prevPage={prevPage}
              page={page}
              emptyResult={emptyResult}
            />
          )}

          {!loading && emptyResult && (
            <View>
              {page === 1 && (
                <View style={{alignItems: "center", justifyContent: "center", marginTop: 50}}>
                  <MaterialCommunityIcons name="magnify-remove-outline" size={50} color="#bbb" />
                  <Text>No results found !</Text>
                </View>
              )}
              {page !== 1 && (
                <View style={{alignItems: "center", justifyContent: "center", marginVertical: 50}}>
                  <MaterialCommunityIcons name="page-last" size={50} color="#bbb" />
                  <Text>{`You are on last page.\nNo more results found`}</Text>
                </View>
              )}
              {page !== 1 && (
                <View>
                  <Button disabled={page === 1} onPress={() => prevPage()}>
                    Back
                  </Button>
                  <Button disabled={emptyResult} onPress={() => nextPage()}>
                    Next
                  </Button>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchbarContainer: {
    padding: 5,
    flexDirection: "row",
    backgroundColor: Colors.primary.color,
  },
  searchbarLeft: {
    width: "80%",
  },
  searchbarRight: {
    padding: 10,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: Colors.primary.color,
    width: "20%",
  },
  container: {
    flex: 1,
  },
  scroll: {
    // marginBottom: 140,
  },
  loading: {
    paddingBottom: 150,
    marginTop: 50,
  },
});
