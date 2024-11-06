
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView, Text, View, ViewStyle } from "react-native";

import JitsiScreen from "../../../base/modal/components/JitsiScreen";
import LoadingIndicator from "../../../base/react/components/native/LoadingIndicator";

import { TEXT_COLOR, navigationStyles } from "./styles";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface IProps {
    _waitingText: string;
}

const ConnectingPage = (props: IProps) => {
    const { t } = useTranslation();
    const [titleValue, setTitleValue] = useState('');
    useEffect(() => {

      async function getTitle() {
        const title = await AsyncStorage.getItem("waitingText");
        if(title!=null){
            setTitleValue(title)
        }else{
            setTitleValue(t("connectingOverlay.joiningRoom"))
        }
      }
    
      getTitle()
    }, [])

    return (
        <JitsiScreen style={navigationStyles.connectingScreenContainer}>
            <View style={navigationStyles.connectingScreenContent as ViewStyle}>
                <SafeAreaView>
                    <LoadingIndicator color={TEXT_COLOR} size="large" />
                   
                     <Text style = { navigationStyles.connectingScreenText }>
                        { titleValue }
                    </Text> 
                </SafeAreaView>
            </View>
        </JitsiScreen>
    );
};


export default ConnectingPage;

// import React from "react";
// import { useTranslation } from "react-i18next";
// import { SafeAreaView, Text, View, ViewStyle } from "react-native";

// import JitsiScreen from "../../../base/modal/components/JitsiScreen";
// import LoadingIndicator from "../../../base/react/components/native/LoadingIndicator";

// import { TEXT_COLOR, navigationStyles } from "./styles";
// import { connect } from "react-redux";

// interface IProps {
//     _waitingText: string;
// }

// const ConnectingPage = (props: IProps) => {
//     const { t } = useTranslation();

//     return (
//         <JitsiScreen style={navigationStyles.connectingScreenContainer}>
//             <View style={navigationStyles.connectingScreenContent as ViewStyle}>
//                 <SafeAreaView>
//                     <LoadingIndicator color={TEXT_COLOR} size="large" />
//                     {props._waitingText!='' && props._waitingText!=undefined && props._waitingText!=null ? 
                    
//                      <Text style = { navigationStyles.connectingScreenText }>
//                         { props._waitingText }
//                     </Text> 
//                     :
//                     <Text style={navigationStyles.connectingScreenText}>
//                     {t("connectingOverlay.joiningRoom")}
//                 </Text>
//                     }
//                 </SafeAreaView>
//             </View>
//         </JitsiScreen>
//     );
// };

// function _mapStateToProps(state: IReduxState) {
//     const { waitingText } = state["features/base/conference"];

//     return {
//         _waitingText: waitingText,
//     };
// }

// export default connect(_mapStateToProps)(ConnectingPage);
