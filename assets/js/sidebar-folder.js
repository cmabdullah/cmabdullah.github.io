function spread(count) {
    document.getElementById('folder-checkbox-' + count).checked =
        !document.getElementById('folder-checkbox-' + count).checked
    document.getElementById('spread-icon-' + count).innerHTML =
        document.getElementById('spread-icon-' + count).innerHTML == 'arrow_right' ?
            'arrow_drop_down' : 'arrow_right'
}

function toggleCategory(categorySlug) {
    const checkbox = document.getElementById('folder-checkbox-' + categorySlug);
    const icon = document.getElementById('spread-icon-' + categorySlug);
    
    if (checkbox && icon) {
        checkbox.checked = !checkbox.checked;
        icon.innerHTML = checkbox.checked ? 'arrow_drop_down' : 'arrow_right';
    }
}