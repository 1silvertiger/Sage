$(document).ready(function() {
    const beginDatePicker = M.Datepicker.getInstance($("#beginDatePicker"));
    const endDatePicker = M.Datepicker.getInstance($("#endDatePicker"));

    const now = new Date();
    beginDatePicker.setDate(now.getDate());
    endDatePicker.setDate(now.getDate());
});