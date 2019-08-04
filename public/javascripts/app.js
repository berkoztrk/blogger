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
          </button>


        </div>
      </div>
    `,
  props: {

  }
}))


Vue.component("formBlog", Vue.extend({
  template: `
  <form>
    <div class="form-group">
      <label for="title">Blog Başlığı</label>
      <input type="text" name="title" class="form-control"  placeholder="Blog Başlığı">
    </div>
    <div class="form-group">
      <label for="content">Blog İçeriği</label>
      <div  id="editor" class="form-control" >
      </div>
      <div id="toolbar"></div>

    </div>

    <button type="submit" class="btn btn-success"><i class="fa fa-save fa-lg"></i> Kaydet</button>
  </form>
  `,
  props: {

  },
  mounted() {
    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],

      [{
        'header': 1
      }, {
        'header': 2
      }], // custom button values
      [{
        'list': 'ordered'
      }, {
        'list': 'bullet'
      }],
      [{
        'script': 'sub'
      }, {
        'script': 'super'
      }], // superscript/subscript
      [{
        'indent': '-1'
      }, {
        'indent': '+1'
      }], // outdent/indent
      [{
        'direction': 'rtl'
      }], // text direction

      [{
        'size': ['small', false, 'large', 'huge']
      }], // custom dropdown
      [{
        'header': [1, 2, 3, 4, 5, 6, false]
      }],

      [{
        'color': []
      }, {
        'background': []
      }], // dropdown with defaults from theme
      [{
        'font': []
      }],
      [{
        'align': []
      }],

      ['clean'] ,
     // remove formatting button
    ];
    var quill = new Quill('#editor', {
      modules: {
        toolbar: toolbarOptions
      },
    });
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

    aaa
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
  }
})