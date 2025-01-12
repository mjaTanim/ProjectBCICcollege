class Animation {
    constructor($selector, isEnabled, type) {
      this.$selector = $selector;
      this.isEnabled= isEnabled;
      this.type = type;
    }

    init() {
      if (!this.isEnabled) {
        return;
      }

      this.$selector.addClass(`data-animate-${this.type}`);
    }

    trigger(delay) {
      if (!this.isEnabled) {
        return;
      }

      this.$selector.addClass(`data-animate-active`);
      this.$selector.get(0).style.setProperty("--transition-delay", `${delay}ms`);
    }

    reset() {
      this.$selector.removeClass(`data-animate-active`);
    }
  }

  class AnimationFactory {
    static default($selector) {
      const animation = new Animation($selector, false, "fade-in-upward");
      animation.init();
      return animation;
    }

    static newFadeInUpward($selector) {
      const animation = new Animation($selector, true, "fade-in-upward");
      animation.init();
      return animation;

    }

    static newFadeInDownward($selector) {
      const animation = new Animation($selector, true, "fade-in-downward");
      animation.init();
      return animation;
    }
  }

  class Element {
    constructor($selector, $childElements, animation) {
      this.$selector = $selector;
      this.$childElements = $childElements;
      this.animation = animation;
    }

    animate() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
      };

      const observer = new IntersectionObserver((entries) => {

        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          for (let i = 0; i < this.$childElements.length; i++) {
            const $element = this.$childElements[i];
            $element.animation.trigger(i * 250);
          }
        }
      }, options);

      observer.observe(this.$selector.get(0));
    }
}

//-----------------------------------------------------------
// Scroll Anchor
//-----------------------------------------------------------
//
class ScrollToAnchor {
  static SCROLL_Y_OFFSET = 50;

  constructor(targetURL) {
    this.targetURL = targetURL;
    this.isInTab;
    this.tabNumber;
    this.tagID;
    this.init();
  }

  handleOnPageLinks() {
    function findAllLinksToAnchorTags() {
      const links = $("body").find("a");

      const res = links.filter(function( index ) {
        return $(this).attr("href") && $(this).attr("href").includes("#");
      })
      return res;
    }

    function travelToAnchorTag(id) {
      const headerHeight = document.querySelector("header").offsetHeight;

      if ($(`#${id}`).length === 0) {
        return;
      }

      const targetElement = $(`#${id}`)[0];


      $("html, body").animate({scrollTop: $(targetElement).offset().top - headerHeight - ScrollToAnchor.SCROLL_Y_OFFSET}, 'slow');
    }

    // if pathname contains anchor tag, then travel to that
    const url = new URL(window.location.href);

    if (url.href.includes("#")) {
      const id = url.href.split("#")[1];
      document.addEventListener('readystatechange', event => {
        if (event.target.readyState === "complete") {
          travelToAnchorTag(id);
      }
      });
    }

    // find all links to anchor tags
    // for all links containing anchor tags,
    findAllLinksToAnchorTags().click(function(e) {

      // if on the same page, find the element with id and navigate to that
      if (this.pathname == window.location.pathname &&
          this.protocol == window.location.protocol &&
          this.host == window.location.host) {
        e.preventDefault();
        const id = $(this).attr("href").split("#")[1];
        travelToAnchorTag(id);
      }
    });
  }

  handleLoadScrollToAnchor() {
    // check if hostname + pathname is in window.location.href;
    const targetElement = document.querySelector(`[data-tagid='${this.tagID}']`);

    if (!targetElement) {
      throw new Error(`[ERROR] ScrollToAnchor: Element with data-tagid attribute value '${this.tagID}' is not found. Please add an data-tagid attribute to target tag to continue.`)
      return;
    }

    // travel to the link
    const offset = 100;
    const headerHeight = document.querySelector("header").offsetHeight;
    const elementScrollPosition = $(targetElement).offset().top;

    $(`html, body`).stop().delay(600).animate({scrollTop: elementScrollPosition - (headerHeight + offset)});
  }

  handleLoadURL() {
    // URL PARAMETER
    // - tag_id (STRING)
    const params = (new URL(this.targetURL)).searchParams;
    this.tagID = params.get("tag_id");
  }

  init() {
    // harvest URL
    this.handleLoadURL();
    this.handleOnPageLinks();

    // travel to link
    if (this.tagID) {
      window.addEventListener("load", e => {
        this.handleLoadScrollToAnchor();
      })
    }
  }
}

jQuery(function() {
  new ScrollToAnchor(window.location.href);
});