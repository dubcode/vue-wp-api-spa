//VARS Go First, then inital set up last

//Set our API URL
const apiUrl = "https://www.governmenteuropa.eu/wp-json/wp/v2/posts?";

//Home var - const because it doesnt change
//Initial template - The inital/default page content template, methods, computed properties and data
const Home = {
  template: "<div><h1>Vue.js & WP API SPA</h1><p>A Vue.js Single Page Application (SPA) using data from unmodified WordPress API.</p></div>"
};

//Post var - let because it does change
//Post template - this is the rendered view.post template, methods, computed properties and data
//The thing you see when you click a post 
let Post = {
  template:
    '<div class="row post"><div class="row post__thumbnail"><img :src="this.thumbnail" alt="this.title" class="post__image"/></div><div class="row post__excerpt"><h1>{{this.title}}</h1><p><b>Published: </b>{{this.date}}</br><b>Source: </b><a v-bind:href="this.link">{{this.link}}</a></p><div class="row" v-html="this.excerpt"></div></div>',

  //post methods 
  methods: {
    //get single post
    getSingle: function(id) {
      var self = this;
      this.id = this.$route.params.id;
      axios
        .get(this.baseUrl + 'include=' + this.id + '&_embed',{
        })
        .then(response => {
          //Set the array position
          this.post = response.data[0];
          // set data as vars to be used in template
          this.id = this.post.id;
          this.date = this.post.date;
          this.catId = this.post.categories;
          this.tags = this.post.tags;
          this.link = this.post.link;
          this.title = this.post.title.rendered;
          this.excerpt = this.post.excerpt.rendered;
          this.thumbnail = this.post._embedded['wp:featuredmedia'][0].media_details.sizes.large.source_url;
          //console.log(response);//
          console.log("You clicked " + this.title + " - Post ID# " + id + " - Cat ID# " + this.catId);
        });
    }},
  //post methods

  //post data
  data() {
    return {
      baseUrl: apiUrl,
      posts: [],
      search: '',
      title: this.title,
      excerpt: this.excerpt,
      thumbnail: this.thumbnail,
    
    };
  },

  //post created
  created() {
    this.getSingle(this.$route.params.id);
  },
  
  //watch route params for new value/ID when a post is clicked immediatelly update route params ID
  watch: {
    "$route.params": {
      handler(newValue) {
        const { id } = newValue;
        this.getSingle(id);
      },
      immediate: true
    }
  }
};
//post

//router
const router = new VueRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/post/:id", component: Post }
  ]
});

//START APP
var app = new Vue({
  el: "#app",
  //Add router to app
  router: router,
  //DATA START
  data: {
    //Set the base URL variable for the data / Json API
    baseUrl: apiUrl,
    //set initial empty data array as name posts
    posts: [],
    //Set number of posts
    countOfPage: 12,
    //Set start page
    currPage: 1,
    //Set initial filter_name variable for text search
    filter_name: ""
  },
  //DATA END
  
  //COMPUTED PROPERTIES START - Computed properties are called everytime there is a mutation / change to the data ie; when a search is performed or a filter is applied the computed properties/functions will run
  computed: {
    
    //CP START - filteredNames / returns all posts with names(coverted to lower case) corresponding to the text search terms
    filteredNames: function() {
      var filter_name = this.filter_name.toLowerCase();
      return this.filter_name.trim() !== ""
        ? this.posts.filter(function(d) {
            return d.title.rendered.toLowerCase().indexOf(filter_name) > -1;
          })
        : this.posts;
    },
    //CP END - filteredNames 
    
    //CP START - pageStart / Resets the returned posts new position on the start page
    pageStart: function() {
      return (this.currPage - 1) * this.countOfPage;
    },
    //CP END - pageStart 
    
    //CP START - totalPage / Resets the number of total pages needed for the pagination
    totalPage: function() {
      return Math.ceil(this.filteredNames.length / this.countOfPage);
    }
    //CP END - totalPage 
    
  },
  //COMPUTED PROPERTIES END 
  
  //METHODS START - Methods are functions performed by actions using handlers ie buttons or returned functions that can be performed onload, mounted, or mutated within a computed property etc
  methods: {
    
    //get single
    getSingle() {},
    
   
    //sort by title
    sortTitles() {
      this.posts = _.orderBy(this.posts, ["title.rendered"], ["asc"]);
    },

    //sort by symbol
    sortDates() {
      this.posts = _.orderBy(this.posts, ["date"], ["asc"]);
    },
    
    //sort category
    sortCategories() {
      this.posts = _.orderBy(this.posts, ["categories"], ["asc"]);
    },

    //set number of pages
    setPage: function(idx) {
      if (idx <= 0 || idx > this.totalPage) {
        return;
      }
      this.currPage = idx;
    },

    //init - Function/method called on mounted to pull intial data array
    init() {
      axios.get(this.baseUrl + '&per_page=100' + '&_embed').then(response => {
        this.posts = response.data;
      });
      
      //initial data return
      return this.posts;
    }
  },
 //METHODS END
  
  //START MOUNTED - run method/function named init
  mounted() {
    this.init();
  }
  //END MOUNTED
  
});
//END APP