import React, { useRef, useEffect, useState, useMemo } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	ImageBackground,
	Animated,
	StyleSheet,
	Button,
} from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import Icon2 from "@expo/vector-icons/MaterialIcons";
import Icon3 from "@expo/vector-icons/Entypo";
import Colors from "../constants/Colors";
import { ScrollView } from "react-native-gesture-handler";
import Fall_detect from "@/components/FallComponent";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Accelerometer, Gyroscope } from "expo-sensors";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";

type SensorData = {
	x: number;
	y: number;
	z: number;
  };


const styles = StyleSheet.create({
	list: {
		marginTop: 300,
	},
	back: {
		width: 370,
		height: 380,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 40,
		marginHorizontal: 20,
	},
	top: {
		flexDirection: "row",
		marginLeft: 260,
	},
	av: {
		width: 40,
		height: 40,
		borderRadius: 10,
	},
	ci: {
		backgroundColor: Colors.colors.yellow,
		width: 8,
		height: 8,
		borderRadius: 4,
		marginLeft: -4,
	},
	col: {
		alignItems: "center",
		marginHorizontal: 20,
		flexDirection: "row",
		marginTop: 30,
	},
	textStorage: {
		fontSize: 24,
		color: Colors.colors.light,
		fontFamily: "Montserrat_800ExtraBold",
	},
	desc: {
		flexDirection: "row",
		alignSelf: "center",
		alignItems: "center",
		marginTop: 10,
		display: 'flex'
	},
	pie: {
		height: 100,
		flex: 1,
		marginLeft: 20,
		marginTop: 15,
	},
	textTotal: {
		color: Colors.colors.light,
		fontSize: 18,
		marginLeft: 10,
		width: 100,
		marginTop: 8,
		fontFamily: "Montserrat_600SemiBold",
	},
	col1: {
		flexDirection: "row",
		marginLeft: 10,
	},
	spc: {
		color: Colors.colors.light,
		fontFamily: "Montserrat_600SemiBold",
		fontSize: 18,
	},
	gb: {
		color: Colors.colors.light,
		fontSize: 12,
		marginTop: 6,
		fontFamily: "Montserrat_600SemiBold",
	},
	items: {
		color: Colors.colors.yellow,
		fontFamily: "Montserrat_600SemiBold",
		fontSize: 28,
	},
	label: {
		color: Colors.colors.light,
		fontFamily: "Montserrat_600SemiBold",
		fontSize: 12,
		marginLeft: 15,
	},
	card: {
		backgroundColor: "#FFF",
		elevation: 4,
		height: 150,
		width: 320,
		alignSelf: "center",
		borderRadius: 20,
		marginTop: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		marginBottom: 2,
		marginLeft: 800,
	},
	col2: {
		alignItems: "center",
		flexDirection: "row",
	},
	friends: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "#FFF",
		marginLeft: -10,
	},
	col3: {
		flexDirection: "row",
		marginTop: 10,
	},
	textOrix: {
		fontSize: 20,
		fontFamily: "Montserrat_600SemiBold",
	},
	duration: {
		fontSize: 15,
		color: "#d8d8d8",
		fontFamily: "Montserrat_600SemiBold",
	},
});

const data = [
	{
		key: 1,
		amount: 80,
		svg: { fill: Colors.colors.light },
	},
	{
		key: 2,
		amount: 20,
		svg: { fill: Colors.colors.yellow },
	},
];
const Fall_Detect = () => {

	const threshold = 0.83;
    const [dataArr, setData] = useState<number[][][]>([]);
    const [dataArr2, setData2] = useState<number[][][]>([]);
    const [aData, setAData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
	const [gData, setGData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
    const [outcome, setOutcome] = useState("");
    const [fallDetector, setFallDetector] = useState<tf.LayersModel>();

	let x: number,y: number,z: number
	let previousX = 0;
    let previousY = 0;
    let previousZ = 0;
    let previousTime = 0;

	const router = useRouter()


	const pan = useRef(new Animated.ValueXY()).current;
	const list = useRef(new Animated.ValueXY()).current;

	const [isFallDetectionActive, setIsFallDetectionActive] = useState(false);
    
      useEffect(() => {
        if (isFallDetectionActive) {
          _subscribe();
        } else {
          _unsubscribe();
        }
      }, [isFallDetectionActive]);
    
      const _subscribe = () => {
        console.log('called')
        Accelerometer.addListener((data) => {
            x=data.x
            y=data.y
            z=data.z
          setAData(data);
          detectFall();
        });
        Gyroscope.addListener((data) => {
          setGData(data);
        });
      };
    
      const _unsubscribe = () => {
        Accelerometer.removeAllListeners();
        Gyroscope.removeAllListeners();
      };

	useEffect(() => {
		Animated.timing(pan, {
			toValue: { x: -400, y: 0 },
			delay: 1000,
			useNativeDriver: false,
		}).start();
		Animated.timing(list, {
			toValue: { x: 0, y: -300 },
			delay: 2000,
			useNativeDriver: false,
		}).start();
	});

	const valueCount = 952;


	useEffect(() => {
        async function loadModel() {
            try {
                const tfReady = await tf.ready();
                const modelJson = await require("@/assets/model/model.json");
                const modelWeight = await require("@/assets/model/weights.bin");
                const fallDetector = await tf.loadLayersModel(
                    bundleResourceIO(modelJson, modelWeight)
                );
                setFallDetector(fallDetector);
                // console.log(fallDetector);
                console.log("[+]Model Loaded");
            } catch (e) {
                console.log(e);
            }
        }
        loadModel();
    }, []);

    async function getResult(res: any) {
		// Type assertion to ensure the result is a single Tensor
		let result = await (fallDetector?.predict(tf.tensor([res])) as tf.Tensor).data();
	
		console.log("Result: ", result[0]);
	
		setOutcome(result[0] > threshold ? "Not Fall" : "Fall");
		
		return result[0] < threshold && console.log(threshold);
	}

	const schedulePushNotification = async () => {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Fall Detected!',
            body: 'Please check on the user.',
            data: { fallDetected: true },
          },
          trigger: { seconds: 2 },
        });
      };

	const detectFall = async () => {
        const currentTime = new Date().getTime();
        console.log(x, y, z)
        
        if (previousTime !== 0) {
            const deltaTime = (currentTime - previousTime) / 1000; // convert to seconds
            const deltaX = x - previousX;
            const deltaY = y - previousY;
            const deltaZ = z - previousZ;
        
            const deltaThreshold = .8; // adjust this value to suit your needs
        
            if (
              (deltaX > deltaThreshold && deltaTime < 0.5) ||
              (deltaY > deltaThreshold && deltaTime < 0.5) ||
              (deltaZ > deltaThreshold && deltaTime < 0.5)
            ) {
              console.log("Fall detected!");
              await schedulePushNotification();
            }
          }
          previousX = x;
          previousY = y;
          previousZ = z;
          previousTime = currentTime;
      };

      const toggleFallDetection = () => {
        setIsFallDetectionActive(!isFallDetectionActive);
      };


    useMemo(() => {
        if (dataArr.length === valueCount) {
            Accelerometer.removeAllListeners();
        }

        if (dataArr2.length === valueCount) {
            Gyroscope.removeAllListeners();
        }
        if (dataArr.length === valueCount && dataArr2.length === valueCount) {
            let res = [];
            for (let i = 0; i < valueCount; i++) {
                res.push([...dataArr[i], ...dataArr2[i]]);
            }
            getResult(res);     
            console.log(res.length);
        }
    }, [dataArr, dataArr2]);


	return (
		<GestureHandlerRootView>
		<View style={{ flex: 1, backgroundColor: Colors.colors.light }}>
			<ImageBackground
				source={require("@/assets/images/bitmap1.png")}
				style={styles.back}
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={()=>router.push('/')}>
						<Icon3
							name='chevron-thin-left'
							color={Colors.colors.light}
							size={25}
						/>
					</TouchableOpacity>
					<View style={styles.top}>
						<Image source={require("@/assets/images/man.png")} style={styles.av} />
						<View style={styles.ci}></View>
					</View>
				</View>
				<View style={styles.col}>
					<Text style={styles.textStorage}>Fall Detect</Text>
					<Icon3
						name='sound-mix'
						color='#FFF'
						style={{ marginLeft: 155 }}
						size={16}
					/>
				</View>
				<View style={styles.desc}>
					<View style={{ flex: 1, marginLeft: 50 }}>
						<Text style={styles.textTotal}>Tracking since</Text>
					</View>
					<View style={{ flex: 1, marginLeft: 80 }}>
						<Text style={styles.items}>689</Text>
						<Text style={styles.label}>Items</Text>
					</View>
				</View>
			</ImageBackground>
			<ScrollView style={{ marginTop: -60 }}>
				<Animated.View style={[pan.getLayout(), styles.card]}>
					<View style={styles.col2}>
						<Icon
							name='email'
							size={60}
							color={Colors.colors.yellow}
							style={{ flex: 1 }}
						/>
						<View style={styles.col2}>
							<Image
								source={require("@/assets/images/logo.png")}
								style={styles.friends}
							/>
							<Image
								source={require("@/assets/images/man.png")}
								style={styles.friends}
							/>
							
						</View>
					</View>

					<View style={styles.col3}>
						
						<Button onPress={toggleFallDetection}
							title={isFallDetectionActive ? 'Deactivate Fall Detection' : 'Activate Fall Detection'}>
						</Button>
					</View>
				</Animated.View>
				<Animated.View style={[list.getLayout(), styles.list]}>
				<Fall_detect value={aData?.x ? aData.x * 100 : 0} />
				<Fall_detect value={aData?.y ? aData.y * 100 : 0} />
				<Fall_detect value={aData?.z ? aData.z * 100 : 0} />
				</Animated.View>
			</ScrollView>
		</View>
		</GestureHandlerRootView>
	);
};
export default Fall_Detect;
