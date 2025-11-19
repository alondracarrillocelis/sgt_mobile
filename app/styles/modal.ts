import { StyleSheet } from 'react-native';

const stylesModal = StyleSheet.create({
     modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalSection: { marginTop: 8 },

  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

export default stylesModal;
