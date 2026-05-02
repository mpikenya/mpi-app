// styles/indexScreen.styles.js

import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.08, // ~36 if width is ~450
    paddingTop: height * 0.06,        // ~50 for 800 height
    paddingBottom: height * 0.05,
    overflow: 'hidden',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: height * 0.025,
    marginLeft: width * 0.05,
  },
  organizationTitle: {
    color: 'white',
    fontSize: width * 0.065,
    fontWeight: '800',
    letterSpacing: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countryTitle: {
    color: 'white',
    fontSize: width * 0.065,
    fontWeight: '800',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  birdImage: {
    width: width * 0.8,
    height: height * 0.3,
    shadowColor: '#0c4a6e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  sloganContainer: {
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  sloganText: {
    color: 'white',
    fontSize: width * 0.09,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: width * 0.11,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  emphasis: {
    fontSize: width * 0.12,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: height * 0.12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: width * 0.12,
    paddingVertical: height * 0.025,
    shadowColor: '#075985',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#0ea5e9',
    fontWeight: '600',
    fontSize: width * 0.045,
  },
  particle: {
    position: 'absolute',
  }
});

export default styles;
