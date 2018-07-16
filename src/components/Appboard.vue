<template>
  <div id="mb-root"
       :class="rootClass"
       :style="styleObject"
  >
      <topic-panel :class="this.shouldShowTopicPanel"
      />
  </div>
</template>

<script>
  import TopicPanel from './TopicPanel.vue';

  export default {
    components: {
      TopicPanel,
    },
    data() {
      const data = {
        // this will only affect the app size if the app is set to "plugin" mode
        styleObject: {
          'height': '100px'
        }
      };
      return data;
    },
    created() {
      window.addEventListener('click', this.closeAddressCandidateList);
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
    },
    mounted() {
      this.$controller.appDidLoad();
    },
    computed: {
      rootClass() {
        if (this.$config.plugin) {
          return 'grid-x';
        } else {
          return 'cell medium-auto grid-x';
        }
      },
      isMobileOrTablet() {
        return this.$store.state.isMobileOrTablet;
      },
      shouldShowTopicPanel() {
        let value = 'topic-panel-true';
        if (this.fullScreenMapEnabled) {
          value = 'topic-panel-false';
        }
        return value;
      },
      geocodeData() {
        return this.$store.state.geocode.data
      },
      ak() {
        const host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.apiKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.apiKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.apiKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.apiKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.apiKey;
        }
      },
      sk() {
        const host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.secretKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.secretKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.secretKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.secretKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.secretKey;
        }
      }
    },
    methods: {
      closeAddressCandidateList() {
        this.$store.state.shouldShowAddressCandidateList = false;
      },
      handleWindowResize() {
        // this only actually affects the size if it is set to "plugin mode"
        if ($(window).width() >= 750) {
          this.styleObject.height = '600px'
        } else {
          this.styleObject.height = 'auto';
        }
      }
    },
  };
</script>

<style>
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  .mb-panel-topics-with-widget {
    height: 50%;
  }

  /* standards applies padding to buttons, which causes some weirdness with
  buttons on the map panel. override here. */
  button {
    padding: inherit;
  }

  .topic-panel-false {
    /* display: none; */
  }

  @media screen and (min-width: 46.875em) {
    .topic-panel-false {
      display: none;
    }
  }

</style>
