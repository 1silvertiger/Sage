<template>
  <input id="datepicker" type="text" class="datepicker">
</template>
    
<script>
module.exports = {
  props: {
    date: {
      type: Date,
      required: false
    },
    maxDate: {
      type: Date,
      required: false
    },
    minDate: {
      type: Date,
      required: false
    },
    parentContainer: {
      type: String,
      required: false
    },
    autoClose: {
      type: Boolean,
      required: false
    },
    format: {
      type: String,
      required: false
    }
  },
  data: function() {
    return {
      currentDate: this.date || new Date()
    };
  },
  mounted: function() {
    const $vm = this;
    M.Datepicker.init(document.querySelector("#datepicker"), {
      autoClose: $vm.autoClose,
      format: $vm.format,
      container: $vm.parentContainer || null,
      defaultDate: $vm.defaultDate,
      setDefaultDate: $vm.defaultDate || false,
      minDate: $vm.minDate,
      maxDate: $vm.maxDate,
      onSelect: function(newDate) {
        $vm.currentDate = newDate;
      }
    });
  }
};
</script>

<style lang="scss" scoped>
</style>

