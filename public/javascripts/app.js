const store = new Vuex.Store({
  state: {
    token: null,
    username: null
  },
  mutations: {
    initStore(state) {
      if (localStorage.getItem("store")) {
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store')))
        );
      }
    },
    setToken(state, token) {
      state.token = token;
    },
    setUsername(state, username) {
      state.username = username
    }
  },
  getters: {
    token: state => {
      return state.token;
    },
    username: state => {
      return state.username
    }
  }
});
store.subscribe((mutation, state) => {
  let store = {
    version: state.version,
    token: state.token,
    username: state.username
  };

  localStorage.setItem('store', JSON.stringify(store));
});

Vue.component('alert', {
  data() {
    return {
      type: 'danger',
      message: "",
      title: "",
      show: false,
      errors: []
    };
  },
  template: `
    <div v-if="show" v-bind:class="[type]" class="alert">
      <strong>{{title}}</strong> -
      <div v-if="message" >{{message}}</div>
      <div v-if="errors">
        <ul>
          <li v-for="error in errors">{{error}}</li>
        </ul>
      </div>
    </div>
  `,
  methods: {
    showAlert(opts) {
      this.type = opts.type;
      this.title = opts.title;
      this.message = opts.message;
      this.show = true;
    },
    hide() {
      this.show = false;
      this.errors = []
      this.message = "";
    },
    showError(message) {
      this.type = "alert-danger";
      this.title = "Hata";
      this.message = message;
      this.show = true
    },
    showErrorMultiple(errors) {
      this.type = "alert-danger";
      this.title = "Hata";
      this.errors = errors;
      this.show = true
    },
    showSuccess(message) {
      this.type = "alert-success";
      this.title = "İşlem Başarılı";
      this.message = message;
      this.show = true;
    }
  },
  computed: {
    alertProps: {
      set: function (opts) {
        this.type = opts.type;
        this.title = opts.title;
        this.message = opts.message;
        this.show = this.message;
      },
      get: function () {
        return this.options;
      }
    }
  }
})


Vue.component('loading-button', {
  props: ['text', "class-prop"],
  data() {
    return {
      loading: false
    }
  },
  template: `<button v-on:click="$emit('click',$event)" :class="classProp"><i v-bind:class="{'d-none' : !isLoading }" class="fa fa-circle-o-notch fa-spin"></i> {{text}}</button>`,
  methods: {

  },
  computed: {
    isLoading: {
      get: function () {
        return this.loading;
      },
      set: function (value) {
        this.loading = value;
      }
    }
  }
})


Vue.component('navbar', {
  data() {
    return {
      login: {
        title: "Giriş/Yeni Üye",
      },

      title: "Yazıt"
    };
  },
  computed: {
    loggedIn() {
      return this.$store.getters.token;
    },
    username() {
      return this.$store.getters.username;
    }
  },
  template: `
    <nav class="navbar navbar-expand-lg bg-success fixed-top">
    <div class="container">
      <router-link to="/" class="navbar-brand">{{title}}</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarResponsive">
        <ul class="navbar-nav ml-auto">
          <li v-if="!loggedIn" class="nav-item">
            <a class="nav-link" href="#" v-on:click="showModal($event)">{{login.title}}</a>
          </li>
            <li v-if="loggedIn" class="nav-item">
              <router-link class="nav-link" to="/profile"><i class="fa fa-lg fa-user"></i> {{username}}</router-link>
            </li>
            <li v-if="loggedIn" class="nav-item">
              <a class="nav-link" v-on:click="logout($event)" href="#"><i class="fa fa-lg fa-power-off"></i> Çıkış</a>
            </li>
        </ul>
      </div>
    </div>
  </nav>`,
  methods: {
    showModal(e) {
      e.preventDefault();
      $("#loginregistermodal").modal("show")
    },
    logout(e) {
      e.preventDefault();
      this.$store.commit("setToken", null);
    }
  }
})

Vue.component('loginregistermodal', {
  data() {
    return {
      links: [{
        title: "Login",
        url: "#"
      }],
      title: "Yazıt",
      loading: false,
      loginData: {
        email: "",
        password: ""
      },
      registerData: {
        email: "",
        username: "",
        password: "",
        passwordConfirm: ""
      },
      loginError: null,
      registerErrors: [],
      loginErrors: []
    };
  },


  methods: {
    setLoading(state) {
      const $loadingBtn = this.$refs.loginBtn;
      const $registerBtn = this.$refs.registerBtn;
      this.loading = state;
      $loadingBtn.isLoading = state;
      $registerBtn.isLoading = state;
    },
    async login(e) {
      e.preventDefault();
      if (this.loading)
        return;
      const $alert = this.$refs.loginAlert;

      this.validateLogin();
      if (this.loginErrors.length) {
        $alert.showErrorMultiple(this.loginErrors);
        return;
      }

      $alert.hide();
      try {
        this.setLoading(true)
        const result = await axios.post("/users/login", this.loginData);
        console.log(result)

        const token = result.data.token;
        if (token) {
          this.$store.commit("setToken", token);
          this.$store.commit("setUsername", result.data.username)
        }
        this.closeModal()
      } catch (error) {
        $alert.showError(
          error.response.data.error
        );
      } finally {
        this.setLoading(false)
      }
    },
    closeModal() {
      $("#loginregistermodal").modal('toggle');

    },
    validateRegister() {

      this.registerErrors = []

      if (!this.registerData.email) {
        this.registerErrors.push("EPosta alanı zorunludur");
      }
      if (!this.registerData.username) {
        this.registerErrors.push("Kullanıcı adı alanı zorunludur");
      }
      if (!this.registerData.password) {
        this.registerErrors.push("Şifre alanı zorunludur");
      }
      if (!this.registerData.passwordConfirm) {
        this.registerErrors.push("Şifre Doğrulaması alanı zorunludur");
      }

      if (this.registerData.password != this.registerData.passwordConfirm) {
        this.registerErrors.push("Şifreler birbiri ile uyuşmuyor");
      }
    },
    validateLogin() {

      this.loginErrors = []

      if (!this.loginData.email) {
        this.loginErrors.push("EPosta alanı zorunludur");
      }
      if (!this.loginData.password) {
        this.loginErrors.push("Şifre alanı zorunludur");
      }
    },
    async register(e) {
      e.preventDefault();
      if (this.loading)
        return;
      const $alert = this.$refs.registerAlert;
      $alert.hide();
      try {
        this.validateRegister();
        if (this.registerErrors.length) {
          $alert.showErrorMultiple(this.registerErrors)
          return
        }
        this.setLoading(true)
        const result = axios.post("/users/register", this.registerData);
        $alert.showSuccess("Kayıt başarılı lütfen giriş yapınız.");
      } catch (error) {
        $alert.showError(
          error.response.data.error
        );
      } finally {
        this.setLoading(false)
      }
    }
  },
  template: `
  <div class="modal " id="loginregistermodal" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
  <div class="modal-dialog ">

    <div class="modal-content">
        <br>
        <div class="modal-header justify-content-center">

        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
          <i class="now-ui-icons ui-1_simple-remove"></i>
        </button>
        <div class="row">
          <ul id="myTab" class="nav nav-tabs justify-content-center" role="tablist">
              <li class="nav-item"><a href="#signin" class="nav-link active" data-toggle="tab" role="tab"><i class="now-ui-icons users_circle-08"></i> Giriş</a></li>
              <li class="nav-item"><a href="#signup" class="nav-link" data-toggle="tab" role="tab"><i class="now-ui-icons users_single-02"></i> Kayıt Ol</a></li>
            </ul>
        </div>
      </div>
      <div class="modal-body login-modal">
        <div id="myTabContent" class="tab-content">
        <div class="tab-pane  fade show active" id="signin">
            <h4 class="title-up">GİRİŞ yap</h4>

            <form class="form-horizontal">
            <fieldset>
            
            <div class="control-group">
              <label class="control-label" for="email">EPosta Adresi:</label>
              <div class="controls">
                <input v-model="loginData.email" required=""  name="email" type="text" class="form-control form-control-lg" placeholder="ornek@ornek.com" required="">
              </div>
            </div>
            <div class="control-group">
              <label class="control-label" for="password">Şifre:</label>
              <div class="controls">
                <input v-model="loginData.password" required=""  name="password" class="form-control form-control-lg" type="password" placeholder="********" >
              </div>
            </div>

            <!-- Button -->
            <div class="control-group">
              <label class="control-label" for="signin"></label>
              <div class="controls">
                <loading-button ref="loginBtn" v-on:click="this.login" class-prop="btn  btn-success  btn-round btn-lg btn-block" text="Giriş" loading="false"/>
              </div>
            </div>
            <alert ref="loginAlert"/>
            </fieldset>
            </form>
        </div>
        <div class="tab-pane fade" id="signup">
            <h4 class="title-up">Üye Ol</h4>
            <form class="form-horizontal">
            <fieldset>
            <div class="control-group">
              <label class="control-label" for="Email">Email:</label>
              <div class="controls">
                <input v-model="registerData.email" name="Email" class="form-control form-control-lg" type="text" placeholder="ornek@ornek.com"  required="">
              </div>
            </div>
            
            <!-- Text input-->
            <div class="control-group">
              <label class="control-label" for="userid">Kullanıcı Adı:</label>
              <div class="controls">
                <input v-model="registerData.username"  name="username" class="form-control form-control-lg" type="text" placeholder="ornekkullaniciadi"  required="">
              </div>
            </div>
            
            <div class="control-group">
              <label class="control-label" for="password">Şifre:</label>
              <div class="controls">
                <input  name="password" v-model="registerData.password" class="form-control form-control-lg" type="password" placeholder="********" required="">
              </div>
            </div>
            
            <!-- Text input-->
            <div class="control-group">
              <label class="control-label" for="passwordConfirm">Şifre Doğrulama:</label>
              <div class="controls">
                <input class="form-control form-control-lg" v-model="registerData.passwordConfirm" name="passwordConfirm" type="password" placeholder="********"  required="">
              </div>
            </div>
            <!-- Button -->
            <div class="control-group">
              <label class="control-label" for="confirmsignup"></label>
              <div class="controls">                
              <loading-button ref="registerBtn" v-on:click="this.register" class-prop="btn btn-success btn-round btn-lg btn-block" text="Kayıt Ol" loading="false"/>
              </div>
            </div>
            <alert ref="registerAlert"/>
            </fieldset>
            </form>
      </div>
    </div>
      </div>
    </div>
  </div>
</div>`
})

const profilePage = Vue.component("profilePage", Vue.extend({
  data(){
    return {
      blogs: []
    }
  },
  template: `
      <div class="section section-basic">
        <div class="container">
          <h3 class="title">Profilim</h3>
          <nav aria-label="breadcrumb" role="navigation">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Anasayfa</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Profilim</li>
            </ol>
          </nav>
          <router-link to="/profile/blogs" class="btn btn-success btn-round">
            <i class="fa fa-plus fa-lg"></i> Yeni Blog
          </router-link>
          <searchComponent/>

          <div class="container">
            <h4>Bloglarım</h4>
            <blogCard class="col-md-10 ml-auto col-xl-6  mr-auto" v-for="blog in blogs" :blog="blog"></blogCard>
          
          </div>


        </div>
      </div>
    `,
  async beforeCreate() {
    const response =await axios.get("/blog");
    this.blogs = response.data.blogs;
  },
  props: {

  }
}))

Vue.component("searchComponent", Vue.extend({

  template: `
  <div class="container">
  <br/>
  <div class="row justify-content-center">
                        <div class="col-12 col-md-10 col-lg-8">
                            <form class="card card-sm">
                                <div class="card-body row no-gutters align-items-center">
                                    <div class="col-auto">
                                        <i class="fas fa-search h4 text-body"></i>
                                    </div>
                                    <!--end of col-->
                                    <div class="col">
                                        <input class="form-control form-control-lg form-control-borderless" type="search" placeholder="Search topics or keywords">
                                    </div>
                                    <!--end of col-->
                                    <div class="col-auto">
                                        <button class="btn btn-lg btn-success" type="submit">Search</button>
                                    </div>
                                    <!--end of col-->
                                </div>
                            </form>
                        </div>
                    </div>
  </div>
  `
}));
Vue.component("blogCard", Vue.extend({
  template: `

    <div class="card" style="width:20rem" >
      <div class="card-body" >
        <h4 class="card-title">{{blog.title}}</h4>
        <h6 class="card-subtitle mb-2 text-muted">{{createdAt}}</h6>
        <p class="card-text">{{blog.description}}</p>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">  <a href="#" class="card-link">Blog sayfasına git</a></li>
          <li class="list-group-item">  <a href="#" class="card-link">Blog sayfasına git</a></li>
          <li class="list-group-item">  <a href="#" class="card-link">Blog sayfasına git</a></li>
        </ul>
      </div>
    </div>
    `,
  props: ["blog"],
  computed : {
    createdAt(){
      return moment(this.blog.created_at).format('DD-MM-YYYY HH:mm');
    }
  }
}))


Vue.component("formBlog", Vue.extend({
  data(){
    return {
      form : {
        title : "",
        description: "",
        errors: []
      }
    }

  },
  template: `
  <form v-on:submit="submit($event)">
    <div class="form-group">
      <label for="title">Blog Başlığı</label>
      <input v-model="form.title" type="text" name="title" class="form-control"  placeholder="Blog Başlığı">
    </div>
    <div class="form-group">
      <label for="title">Blog Tanımı</label>
      <input v-model="form.description" type="text" name="description" class="form-control"  placeholder="Blog Tanımı">
    </div>
    <div class="form-group">
      <label for="content">Blog İçeriği</label>
      <textarea id="blogContent" name="content"></textarea>
    </div>
    <alert ref="blogAlert"/>
    <button type="submit" class="btn btn-success"><i class="fa fa-save fa-lg"></i> Kaydet</button>
    
  </form>
  `,
  props: {

  },
  methods:  {
    validate(){
      this.errors = []
      if(!this.form.title)
        this.errors.push("Başlık alanı zorunludur.");
      if(!this.description)
        this.errors.push("Blog Tanımı alanı zorunludur");
      if(!this.content)
        this.errors.push("Blog İçeriği alanı zorunludur");
    },

    async submit(e){
      e.preventDefault();
      this.validate();
      const $alert = this.$refs.blogAlert;
      if(this.errors.length){
        $alert.showErrorMultiple(this.errors);
        return;
      }

      const formData = {
        title:  this.form.title,
        content : this.content,
        description : this.form.description
      }

      try {
        const result = await axios.post("/blog/save",formData);
        router.push('/profile')
      } catch (error) {
        $alert.showError(error.response.data.errror);
      }
 
    }
  },
  computed: {
    content() {
      return $("#blogContent").val()
    }
  },
  mounted() {
    $('#blogContent').summernote();
  }
}))

const blogEdit = Vue.component("blogEdit", Vue.extend({
  template: `
  <div class="section section-basic">
    <div class="container">
      <h3 class="title">Blog Oluştur</h3>
      <nav aria-label="breadcrumb" role="navigation">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><router-link to="/">Anasayfa</router-link></li>
          <li class="breadcrumb-item"><router-link to="/profile">Profilim</router-link></li>
          <li class="breadcrumb-item active" aria-current="page">Blog Oluştur</li>
        </ol>
      </nav>

      <formBlog/>
      
    </div>
  </div>
  `,
  props: {

  }
}))

const indexPage = Vue.component("indexPage", Vue.extend({
  template: `
  <div class="section section-basic">
    <div class="container">
    <h3 class="title">Index</h3>

    </div>
  </div>
  `,
  props: {

  }
}))
const routes = [{
    path: "/profile",
    component: profilePage
  },
  {
    path: "/",
    component: indexPage
  },
  {
    path: "/profile/blogs",
    component: blogEdit
  },
]
const router = new VueRouter({
  routes
})
var app = new Vue({
  el: '#app',
  data: {},
  store,
  router,
  template: `
    <div>
      <navbar/>
      <loginregistermodal/>
      <router-view></router-view>
    </div>
  `,
  beforeCreate() {
    this.$store.commit('initStore');
    axios.defaults.headers.common['JWT'] = this.$store.getters.token;
  }
})