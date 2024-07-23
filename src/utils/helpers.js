const getStripeInterval = (interval) => {
    if (interval === 'Daily') {
        return {
            interval: 'day',
            cycle: 1
        }
    }
    if (interval === 'Weekly') {
        return {
            interval: 'week',
            cycle: 1
        }
    }
    if (interval === 'Monthly') {
        return {
            interval: 'month',
            cycle: 1
        }
    }
    if (interval === 'Bi-weekly') {
        return {
            interval: 'week',
            cycle: 2
        }
    } else {
        return {
            interval: 'week',
            cycle: 1
        }
    }

}

module.exports = { getStripeInterval }