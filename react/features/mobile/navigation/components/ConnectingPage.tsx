import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, Text, View, ViewStyle } from 'react-native';

import JitsiScreen from '../../../base/modal/components/JitsiScreen';
import LoadingIndicator from '../../../base/react/components/native/LoadingIndicator';

import { TEXT_COLOR, navigationStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ConnectingPage = () => {
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
