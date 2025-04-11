import { TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import BaseTransactionItem from '../common/BaseTransactionItem';
import EditTransactionModal from './EditTransactionModal';

const TransactionItem = ({ transaction }) => {
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <>
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <BaseTransactionItem transaction={transaction} />
            </TouchableOpacity>
            <EditTransactionModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                transaction={transaction}
            />
        </>
    );
};

export default TransactionItem;
