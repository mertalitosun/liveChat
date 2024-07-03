document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const allCustomers = document.querySelectorAll('.allCustomer');

    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        allCustomers.forEach(customer => {
            const customerName = customer.querySelector('.customerName').textContent.toLowerCase();
            if (customerName.includes(searchTerm)) {
                customer.style.setProperty('display', 'block', 'important');
            } else {
                customer.style.setProperty('display', 'none', 'important');
            }
        });
    });
});
