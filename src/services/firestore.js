import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

var config = {
    apiKey: "AIzaSyCxAwp6sBiAS--lOtE8lFao_0oyAZXjyoA",
    authDomain: "medium-hackd-analytics.firebaseapp.com",
    databaseURL: "https://medium-hackd-analytics.firebaseio.com",
    projectId: "medium-hackd-analytics",
    storageBucket: "medium-hackd-analytics.appspot.com",
    messagingSenderId: "379382572702",
    appId: "1:379382572702:web:3bb1a734aa92615c9ffd8f"
};

firebase.initializeApp(config);


const db = firebase.firestore();

// Fetch statistics only
// returns -1 if error
export const getStatistics = () => {
    return db.collection('requests')
        .doc('statistics')
        .get()
        .then(
            snapshot => snapshot.data()
        )
        .catch(error => -1);
};

// fetch all requests (no statistics doc included)
// does not handle errors
export const getRequests = () => {
    return db.collection('requests')
        .get()
        .then(
            snapshot => {
                const requests = [];
                snapshot.forEach(doc => {
                    if (doc.id != "statistics") {
                        const data = doc.data();
                        requests.push(data);
                    }
                });
                return requests;
            }
        );
};