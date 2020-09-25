const functions = require('firebase-functions');
const admin = require('firebase-admin');
const normalizeUrl = require("normalize-url");

admin.initializeApp();

const sitesRef = admin.firestore().collection("listings");
const tagsRef = admin.firestore().collection("tags");

const handleServerError = (error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`errorCode: ${errorCode}`);
    console.log(`errorMessage: ${errorMessage}`);
    return res.status(500).json({
        error: 'Internal server error. Please try again later.'
    });
}

const validURL = (str) => {
    var pattern = new RegExp(
     '^(https?:\\/\\/)?'+ // protocol
     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
     '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
     '(\\:\\d+)?(\\/[-a-z\\d#%_.~+]*)*'+ // port and path
     '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
     '(\\#[-a-z\\d_]*)?$','i') // fragment locator
    ;

    return Boolean(pattern.test(str));
 }

let chooseWeighted = (items, chances) => {
    let chanceSum = chances.reduce((acc, curr) => {
        return acc + curr;
    });

    let acc = 0;
    let chancesAcc = chances.map((chance) => {
        return acc += chance;
    });

    let rand = Math.random() * chanceSum;

    return chancesAcc.findIndex((chanceAcc) => {
        return chanceAcc >= rand;
    });
}

exports.likeSite = functions.https.onRequest(async () => {
    res.set('Access-Control-Allow-Origin', 'https://...');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');

    let body = JSON.parse(req.body);
    let address = body.address;

    let siteRes = await siteRef
        .where('address', '==', normalizeUrl(address))
        .limit(1)
        .get()
        .catch(handleServerError)
    ;
    
    // let siteData = siteRes.docs[0].data();

    // if ('key' in siteData.likes) {
        
    // }
});

exports.addSite = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://...');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');

    let body = JSON.parse(req.body);
    let address = body.address;
    let tags = body.tags;

    if (tags.length < 3) {
        return res.status(405).json({
          error: 'less than 3 tags',
        });
    }

    if (!validURL(address)) {
        return res.status(405).json({
            error: 'invalid URL'
        });
    }

    let url = normalizeUrl(address);
    
    let siteExistsRes = await sitesRef
        .where('address', '==', url)
        .limit(1)
        .get()
        .catch(handleServerError)
    ;

    if (siteExistsRes.docs.length !== 0) {
        return res.status(405).json({
            error: `${url} is already indexed`,
            address: url

        });
    }

    let tagsObj = {}
    for (tag of tags) {
        tagsObj[tag] = {
            score: 100,
            count: 1
        }
    }

    await sitesRef.add({
        randIndex: Math.random(),
        address: url,
        createDate: new Date(),
        lastFetch: new Date(),
        views: 0,
        points: 0,
        flags: 0,
        likes: {},
        dislikes: {},
        tags: tagsObj
    })
    .catch(handleServerError)

    for (tag in tagsObj) {
        // eslint-disable-next-line no-await-in-loop
        let tagsRes = await tagsRef
            .where('tag', '==', tag)
            .limit(1)
            .get()
            .catch(handleServerError)
        ;
        if (tagsRes.docs.length !== 0) {
            // eslint-disable-next-line no-await-in-loop
            await tagsRef.doc(tagsRes.docs[0].ref.id).update({
                score: admin.firestore.FieldValue.increment(tagsObj[tag].score),
                count: admin.firestore.FieldValue.increment(1),
                searchable: (
                    tagsRes.docs[0].data().searchable ||
                    tagsRes.docs[0].data().score + tagsObj[tag].score >= 100
                ),
                randIndex: Math.random()
            })
            .catch(handleServerError)
        } else {
            // eslint-disable-next-line no-await-in-loop
            await tagsRef.add({
                tag: tag,
                views: 0,
                count: 1,
                score: tagsObj[tag].score,
                likes: 0,
                dislikes: 0,
                searchable: (tagsObj[tag].score >= 100),
                randIndex: Math.random(),
            })
            .catch(handleServerError)
        }
    }

    return res.status(201).json({
        address: url
    });
});

exports.getThreeRandomTags = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://...');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Max-Age', '3600');

    const randomIndex = Math.random();
    let tagsRes;

    if (Math.random() > 0.5) {
        tagsRes = await tagsRef
            .where('randIndex', '>=', randomIndex)
            .orderBy('randIndex', 'asc')
            .limit(3)
            .get()
            .catch(handleServerError)
        ;

        if (tagsRes.docs.length === 0) {
            tagsRes = await tagsRef
                .where('randIndex', '<=', randomIndex)
                .orderBy('randIndex', 'desc')
                .limit(3)
                .get()
                .catch(handleServerError)
            ;
        }
    } else {
        tagsRes = await tagsRef
            .where('randIndex', '<=', randomIndex)
            .orderBy('randIndex', 'desc')
            .limit(3)
            .get()
            .catch(handleServerError)
        ;

        if (tagsRes.docs.length === 0) {
            tagsRes = await tagsRef
                .where('randIndex', '>=', randomIndex)
                .orderBy('randIndex', 'asc')
                .limit(3)
                .get()
                .catch(handleServerError)
            ;
        }
    }

    for (let i = 0; i < tagsRes.docs.length; i++) {
        tagsRef.doc(tagsRes.docs[i].ref.id).update({
            randIndex: Math.random()
        }).catch(handleServerError);
    }
        
    res.status(200).json({
        tags: tagsRes.docs.map((doc) => doc.data().tag)
    });
});

exports.getTokenfieldAutocomplete = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://...app');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Max-Age', '3600');

    const query = req.query.q;
    const strFrontCode = query.slice(0, query.length-1);
    const strEndCode = query.slice(query.length-1, query.length);

    const start = query;
    const end = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);

    tagsRes = await tagsRef
        .where('searchable', '==', true)
        .where('tag', '>=', start)
        .where('tag', '<', end)
        .orderBy('tag', 'asc')
        .limit(15)
        .get()
        .catch(handleServerError)
    ;
    
    let tagData = tagsRes.docs
        .map((doc) => (doc.data()))
        .sort((a, b) => (b.score - a.score))
    ;

    if (tagData.length > 3) {
        tagData = tagData.slice(0, 3);
    }

    res.status(200).json(tagData.map((doc, id) => {
        return { id: id, name: doc.tag }
    }));
});

exports.getRandomSite = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://...app');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Max-Age', '3600');

    // const tokenId = req.get('Authorization').split('Bearer ')[1];

    // return admin.auth().verifyIdToken(tokenId)
    //     .then((decoded) => res.status(200).send(decoded))
    //     .catch((err) => res.status(401).send(err))
    // ;

    const randomIndex = Math.random();
    let siteQueryRes;

    if (Math.random() > 0.5) {
        siteQueryRes = await sitesRef
            .where('randIndex', '>=', randomIndex)
            .orderBy('randIndex', 'asc')
            .limit(5)
            .get()
            .catch(handleServerError)
        ;

        if (siteQueryRes.docs.length === 0) {
            siteQueryRes = await sitesRef
                .where('randIndex', '<=', randomIndex)
                .orderBy('randIndex', 'desc')
                .limit(5)
                .get()
                .catch(handleServerError)
            ;
        }
    } else {
        siteQueryRes = await sitesRef
            .where('randIndex', '<=', randomIndex)
            .orderBy('randIndex', 'desc')
            .limit(5)
            .get()
            .catch(handleServerError)
        ;

        if (siteQueryRes.docs.length === 0) {
            siteQueryRes = await sitesRef
                .where('randIndex', '>=', randomIndex)
                .orderBy('randIndex', 'asc')
                .limit(5)
                .get()
                .catch(handleServerError)
            ;
        }
    }

    let accessChance = siteQueryRes.docs.map((site) => {
        let data = site.data();
        let viewsFactor = Number((1 + ((data.views || 0) * 0.05)));
        let pointsFactor = Number((1 + ((data.points || 0) * 0.1)));
        return (pointsFactor / viewsFactor);
    })
    
    let choiceIndex = chooseWeighted(siteQueryRes.docs, accessChance);

    for (let i = 0; i < siteQueryRes.docs.length; i++) {
        if (i === choiceIndex) {
            sitesRef.doc(siteQueryRes.docs[i].ref.id).update({
                randIndex: Math.random(),
                lastFetch: new Date(),
                views: admin.firestore.FieldValue.increment(1)
            }).catch(handleServerError);
        } else {
            sitesRef.doc(siteQueryRes.docs[i].ref.id).update({
                randIndex: Math.random(),
                lastFetch: new Date()
            }).catch(handleServerError);
        }
    }

    res.status(200).json({
        address: siteQueryRes.docs[choiceIndex].data().address
    });
});

// exports.helloWorld = functions.https.onRequest((req, res) => {
//     res.set('Access-Control-Allow-Origin', 'https://...');
//     res.set('Access-Control-Allow-Credentials', 'true');
//     res.set('Access-Control-Allow-Methods', 'GET');
//     res.set('Access-Control-Allow-Headers', 'Content-Type');
//     res.set('Access-Control-Max-Age', '3600');
// });

// exports.addMessage = functions.https.onRequest(async (req, res) => {
//     res.set('Access-Control-Allow-Origin', 'https://...');
//     res.set('Access-Control-Allow-Credentials', 'true');
//     res.set('Access-Control-Allow-Methods', 'POST');
//     res.set('Access-Control-Allow-Headers', 'Content-Type');
//     res.set('Access-Control-Max-Age', '3600');
//     const original = req.body;
//     const writeResult = await admin.firestore().collection('messages').add({
//         original: original
//     });

//     res.json({
//         result: `Message with ID: ${writeResult.id} added.`
//     });
// });

// exports.makeUppercase =
//     functions
//     .firestore
//     .document('/messages/{documentId}')
//     .onCreate((snap, context) => {
//         const original = snap.data().original;
//         functions.logger.log(
//             'Uppercasing',
//             context.params.documentId,
//             original
//         );
//         const uppercase = original.toUpperCase();
//         return snap.ref.set({ uppercase }, { merge: true });
//     })
// ;