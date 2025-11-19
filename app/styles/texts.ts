import { StyleSheet } from 'react-native';

const stylesText = StyleSheet.create({
    title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
    subtitle: { fontSize: 14, fontStyle: 'italic', color: '#555' },


    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffffff',
        marginLeft: 24,
        marginTop: 16,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
    clientInfo: { flex: 1, marginLeft: 12 },
    clientName: { fontSize: 16, fontWeight: '600', color: '#000' },
    clientText: { fontSize: 14, color: '#666', marginTop: 2 },
    clientArrow: { fontSize: 24, color: '#666', marginRight: 4 },
    emptyText: { fontSize: 16, color: '#999999' },
    modalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#777',
        marginTop: 12,
    },
    modalValue: {
        fontSize: 16,
        color: '#333',
        marginTop: 4,
    },
    modalSubtitle: { fontSize: 16, fontStyle: 'italic', color: '#666' },
    detailText: { fontSize: 14, color: '#444', marginLeft: 6 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 14 },

    sectionText: { fontSize: 14, color: '#555', marginTop: 4 },
    timerLabel: { fontSize: 14, color: '#666' },
    timerDisplay: { fontSize: 20, fontWeight: '700', color: '#000' },
    actionText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    summaryText: { fontSize: 15, color: '#1A1A1A', fontWeight: '600' },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        color: '#333',
    },
      completedText: { fontSize: 14, fontStyle: 'italic', color: '#666' },

});

export default stylesText;
