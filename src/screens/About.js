import React from "react";
import { List, Divider } from "react-native-paper";
import * as Linking from "expo-linking";
import { theme } from "../theming/theme";

const AboutScreen = ({ navigation }) => {
    return (
        <>
            <List.Section
                style={{
                    flex: 1,
                    marginTop: 0,
                    backgroundColor: theme.colorDarkPrimaryDark,
                    marginBottom: 0,
                }}
            >
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="Version"
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    description="Stable 1.0.0"
                />
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="Build Time"
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    description="24-12-20  12:00 PM"
                />

                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    title="What's new"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/LNReader/commits/master"
                        )
                    }
                />
                <Divider />

                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    title="Github"
                    description="https://github.com/rajarsheechatterjee/LNReader"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/LNReader"
                        )
                    }
                />
                <List.Item
                    titleStyle={{ color: theme.textColorPrimaryDark }}
                    descriptionStyle={{ color: theme.textColorSecondaryDark }}
                    title="Backend"
                    description="https://github.com/rajarsheechatterjee/LNReader-backend"
                    onPress={() =>
                        Linking.openURL(
                            "https://github.com/rajarsheechatterjee/LNReader-backend"
                        )
                    }
                />
            </List.Section>
        </>
    );
};

export default AboutScreen;
