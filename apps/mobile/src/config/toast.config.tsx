import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const toastConfig = {
  success: ({ text1, text2, ...props }: any) => (
    <BaseToast
      {...props}
      style={[styles.base, { borderLeftColor: '#16a34a', borderLeftWidth: 4 }]}
      contentContainerStyle={styles.contentContainer}
      text1Style={[styles.text1, { color: '#16a34a' }]}
      text2Style={styles.text2}
      text1={text1}
      text2={text2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
        </View>
      )}
    />
  ),
  error: ({ text1, text2, ...props }: any) => (
    <ErrorToast
      {...props}
      style={[styles.base, { borderLeftColor: '#dc2626', borderLeftWidth: 4 }]}
      contentContainerStyle={styles.contentContainer}
      text1Style={[styles.text1, { color: '#dc2626' }]}
      text2Style={styles.text2}
      text1={text1}
      text2={text2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={24} color="#dc2626" />
        </View>
      )}
    />
  ),
  info: ({ text1, text2, ...props }: any) => (
    <InfoToast
      {...props}
      style={[styles.base, { borderLeftColor: '#2563eb', borderLeftWidth: 4 }]}
      contentContainerStyle={styles.contentContainer}
      text1Style={[styles.text1, { color: '#2563eb' }]}
      text2Style={styles.text2}
      text1={text1}
      text2={text2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={24} color="#2563eb" />
        </View>
      )}
    />
  ),
  warning: ({ text1, text2, ...props }: any) => (
    <BaseToast
      {...props}
      style={[styles.base, { borderLeftColor: '#d97706', borderLeftWidth: 4 }]}
      contentContainerStyle={styles.contentContainer}
      text1Style={[styles.text1, { color: '#d97706' }]}
      text2Style={styles.text2}
      text1={text1}
      text2={text2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={24} color="#d97706" />
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  base: {
    borderLeftWidth: 4,
    minHeight: 60,
    height: 'auto',
    direction: 'rtl',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    direction: 'rtl',
    flex: 1,
    // flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'left',
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    marginRight: 0,
  },
});

export default toastConfig;

