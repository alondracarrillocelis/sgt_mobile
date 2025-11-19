import { StyleSheet } from 'react-native';

const stylesHeader = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  headerBadge: {
    backgroundColor: '#D1E4FA',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 22,
    width: '75%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  headerIcon: {
    backgroundColor: '#3C8BF2',
    width: 55,
    height: 55,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default stylesHeader;
