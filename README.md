# RichTableComponent

TODO: Write a gem description

## Installation

Add this line to your application's Gemfile:

    gem 'rich_table_component'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install rich_table_component

## Usage




### CONTROLLER

rich_table_component(relation = {}, _sort_column = {}, _sort_direction = nil, pagination = true)



*relation (required)*

- value: ActiveRecord::Relation
- description:



*sort_column (optional)*

- value: string
- default: `created_at`
- description:

    default kolom sorting yang diinginkan saat pertama kali ditampilkan



*sort_direction (optional)*

- value: string
- default: 'DESC'
- description:

    mode urutan pada sorting dari kolom default/sort_column



*pagination (optional)*

- value: boolean
- default: true
- description:

  Menyertakan fitur pagination jika true

contoh penggunaan pada controller:
```ruby
@posts = rich_table_component Post
@posts = rich_table_component Post, sort_column: 'title', sort_direction: 'DESC'
@posts = rich_table_component Post, sort_column: 'title', sort_direction: 'DESC', pagination: false
@posts = rich_table_component Post, pagination: false
@posts = rich_table_component @q.result
@posts = rich_table_component @q.result, sort_column: 'title', sort_direction: 'DESC'
@posts = rich_table_component @q.result, sort_column: 'title', sort_direction: 'DESC', pagination: false
@posts = rich_table_component @q.result, pagination: false
@posts = rich_table_component @user.posts
```
instance name must plural e.g. @posts not @post

```ruby
@posts = rich_table_component Post # right
@post = rich_table_component Post # WRONG
```





### VIEW
```haml
= render 'shared/rtc/component' 
```
Merender file shared/rtc/_component.html.haml


PARAMETER:



*rtc_controller_name*

- value: string
- default: controller_name atau string dari controller yang menghandle request
- description:

    Menentukan instance ActiveRecord::Relation yang ingin ditampilkan. Jika ingin menampilkan koleksi post melalui `PostsController#index`, maka default valuenya adalah 'posts'. Jika request bukan `controller#index` maka rtc_controller_name perlu dituliskan. Misalnya ingin menampilkan koleksi post pada halaman user pengupload atau `UsersController#show`, maka pada method `#show` perlu didefinisikan instance `@posts` dan parameter rtc_controller_name perlu dituliskan pada `render 'shared/rtc/component'` dengan value 'posts'.





*rtc_partial*

- value: string
- default: rtc_controller_name.singularize (jika default, merender file partial pada directory yang memanggil)




*rtc_title*

- value: boolean, Hash{ title: 'Judul', wrapper: 'h1'/'h2'/'h3'/'h4' }, or string
- default: true
- description: 





*rtc_header*

- value: boolean
- default: true
- description:

    Menampilkan kotak header tabel jika true, dan tidak ditampilkan jika false




*rtc_column_header*

- value: boolean
- default: true
- description:

    Menampilkan kotak header kolom header jika true, dan tidak ditampilkan jika false




*rtc_footer*

- value: boolean
- default: true
- description:

    Menampilkan kotak footer tabel jika true, dan tidak ditampilkan jika false




*headers (required)*

- value: Array of Object
- description:
    Mendefinisikan atribut/kolom yang akan ditampilkan sebagai kolom header, berupa atribut pada model atau asosiasi model
- example: 
```haml
[:nip, :name, 'department', :nidn, :certification_number, 'user.email']
```



*columns_width*

- value: Array of Integer
- default: [] / empty array
- description:

    Mengatur ukuran tiap kolom pada tabel. Nilai array merupakan rasio ukuran, misal: [1, 2, 2] berarti [20%, 40%, 40%]




*search_constraint*

- value: symbol
- default: nil
- description:

    Mendefinisikan pencarian yang disediakan untuk single search pada kanan atas. Menggunakan syntax ransack
- example:
```haml
:title_or_body_or_author_name_or_author_address_street_cont
```





*advanced_search_attributes*

- value: Array of Object. Object can be string or symbol or hash {input: ..., params: simple_form input params}
- default: nil
- description:

    Menampilkan element advanced search pada rtc
- example:
```haml
advanced_search_attributes: [ :nidn, 
                              :name,
                              :nip,
                              :ktp_number,
                              {input: 'department_id', params: department_params},  
                              {input: :employment_status, params: {as: :select, label: 'employment_status', collection: LECTURER_EMPLOYMENT_STATUS.collect(&:reverse), prompt: :true}}, 
                              {input: :activity_status, params: {as: :select, label: 'active_status', collection: LECTURER_ACTIVE_STATUS.collect(&:reverse), prompt: :true}}, 
                              :birth_date, 
                              'user.email',
                              :birth_place, 
                              {input: :gender, params: {as: :select, label: 'gender', collection: GENDER.collect(&:reverse), prompt: :true}}, 
                              :certification_number ] 
```



*export_attributes*

- value: Array of Object. Object can be string or symbol
- default: nil,
- description:

    Menyertakan fitur export pdf dan excel dengan menspesifikasikan attribut yang ingin di-sertakan
- example:
  [:nip, :name, 'department', :nidn, :certification_number, 'user.email']




*add_form_remote*

- value: boolean
- default: false
- description:

    Menghidupkan form ajax pada button tambah jika true




*rtc_empty_data_message*

- value: string
- default: sanitize "Data #{t(rtc_controller_name)} kosong"
- description:

    Text yang ditampilkan pada tabel jika data kosong. text dapat dalam format html




*search_key*

- value: string
- default: 'q'
- description:

    Param key yang dibutuhkan pada fitur pencarian menggunakan gem ransack. Jika tidak menggunakan ransack, pada controller tidak perlu memiliki instance @q




*rtc_button_new*

- value: boolean
- default: true
- description:

    Render default button new if true



*rtc_actions*

- value: Element or Array of Element
- default: nil
- description:

    Render element(s) side by side with button new




*toggle_view*

- value: boolean
- default: false
- description:
    render toggle rtc view. thumbnail/list




*table_title*

- value: string
- default: controller_name
- description:

    Render table title



- rtc_selection_checkbox (To be developed)
- recapitulation_matrix (removed from rtc component to dedicated component)








### CONTOH KASUS:


#### Kasus normal

Menampilkan rtc berupa list `page` pada halaman `index` controller `PagesController` atau `PagesController#index`. RTC yang ingin ditampilkan secara lengkap (memiliki fitur advanced search dan export pdf & xls)

Yang perlu dilakukan:

1. Controller: Pada `PagesController` pages_controller.rb dalam method `index` harus memiliki instance @q dan @pages repond dengan respond_to_remote :index, @pages
```ruby
def index
  ...
  @q = Page.search(params[:q])
  @pages = rich_table_component @q.result
  respond_to_remote :index, @pages
end
```


2. View: Pada view/pages/index.html.haml 
```haml
= render 'shared/rtc/component', 
  headers: [:title, :body, ['author.name', 'author'], 'author.email', nil], 
  columns_width: [2, 6, 1, 1, 1],
  search_constraint: :title_or_body_or_author_name_or_author_email_cont, 
  add_form_remote: true, 
  export_attributes: [:title, :body, ['author.name', 'author'], 'author.email'],
  advanced_search_attributes: [ :title, 
                                :body,
                                'author.name',
                                'author.email',
                                'author.address.city.name']
```

3. View: Pada view/pages/_page.html.haml
```haml
// Jumlah td disesuaikan dengan jumlah element pada headers, untuk kasus ini berjumlah 5
%tr
  %td
    = page.title
  %td
    = page.body
  %td
    = page.author.name
  %td
    = page.author.email
  %td
    = link_to delete .....
```




#### Kasus me-render partial custom yang berbeda

Secara default baris yang dirender adalah _model.html.haml, misal _page.html.haml
untuk merender partial yang berbeda untuk model page misalnya: _subscriber_page.html.haml dapat dilakukan dengan mendefinisikan parameter `rtc_partial` dengan lokasi file partial tersebut `pages/subscriber_page`

    = render 'shared/rtc/component', 
      headers: [:title, :body, ['author.name', 'author'], 'author.email', nil], 
      columns_width: [2, 6, 1, 1, 1],
      search_constraint: :title_or_body_or_author_name_or_author_email_cont, 
      rtc_partial: 'pages/subscriber_page'

Jika pada rtc terdapat button tambah, edit, atau apapun yang mengharuskan merender kembali partial custom, maka tambahkan params rtc_partial pada:
  form: 
    hidden_field_tag 'rtc_partial', 'home/lecturer_academic_term'

  atau pada
  controller:
    params[:rtc_partial] = 'home/lecturer_academic_term'





#### Kasus mengacu controller yang berbeda

Misal menampilkan koleksi post pada home

  Controller: home#index
```ruby
...
@q = Post.search(params[:q])
@posts = rich_table_component @q.result
...
```

  View:
```haml
= render 'shared/rtc/component', 
  headers: [:title, :body, ['author.name', 'author'], 'author.email', nil], 
  columns_width: [2, 6, 1, 1, 1],
  search_constraint: :title_or_body_or_author_name_or_author_email_cont,
  rtc_controller_name: 'posts'
```




#### Kasus dua atau lebih table dalam halaman yang sama

Misal menampilkan koleksi post pada home

Controller: home#index
```ruby  
def index
  ...
  @q = Post.search(params[:q])
  @posts = rich_table_component @q.result

  @p = Post.search(params[:p], search_key: :p)
  @second_posts = rich_table_component @p.result

  @r = Post.search(params[:r], search_key: :r)
  @third_posts = rich_table_component @p.result
  ...
end
```

  View:

```haml  
  = render 'shared/rtc/component', 
    headers: [:title, :body, ['author.name', 'author'], 'author.email', nil], 
    columns_width: [2, 6, 1, 1, 1],
    search_constraint: :title_or_body_or_author_name_or_author_email_cont,
    rtc_controller_name: 'posts'
```    

```haml  
  = render 'shared/rtc/component', 
    headers: [:title, :body, ['author.name', 'author'], 'author.email', nil], 
    columns_width: [2, 6, 1, 1, 1],
    search_constraint: :title_or_body_or_author_name_or_author_email_cont,
    rtc_controller_name: 'second_posts',
    rtc_partial: 'posts/second_post',
    search_key: 'p'
```    

```haml  
  = render 'shared/rtc/component', 
    headers: [:title, :body, ['author.name', 'author'], 'author.email', nil], 
    columns_width: [2, 6, 1, 1, 1],
    search_constraint: :title_or_body_or_author_name_or_author_email_cont,
    rtc_controller_name: 'third_posts',
    rtc_partial: 'posts/third_post',
    search_key: 'r'
```    



#### Kasus updating tapi bukan dari tombol edit standar (misal: approve/reject)

tambahkan class html '.edit' pada button custom
pada method terakhir yang terpanggil sebelum baris terupdate, harus respond remote to :update, 
dan harus memiliki params[:rtc_partial] yang diassign di controller ATAU dilempar dari form ATAU button edit 
  - assign di controller:  params[:rtc_partial] = 'admin/departments/student'
  - assign pada form (jika melewati modal form, seperti edit pada umumnya)

```ruby  
simple_form_for ... do |f|
  = hidden_field_tag 'rtc_partial', 'admin/departments/student'
  ...
end
```
  - assign dari button (jika tidak melewati modal)
```ruby  
= link_to 'approve', approve_post_path(post, rtc_partial: 'admin/departments/student'), remote: :true, class: 'btn edit'
```

Jika model yang diupdate berbeda dengan model controllernya, misal mengupdate `post` pada halaman `UsersController#show`,
sertakan rtc_controller_name berdampingan dengan rtc_partial,
  contoh: 
    link_to 'approve', approve_post_path(post, rtc_controller_name: 'admin/departments/student', rtc_partial: 'admin/departments/student'), remote: :true, class: 'btn edit'


a. Aksi tidak memunculkan modal, tetapi langsung update. Dengan custom method, model yang diupdate sesuai dengan controller

View:
  tambahkan class html '.edit' pada button custom

```ruby  
...
= link_to 'approve', approve_post_path(post), remote: :true, class: 'btn edit'
...
```

Controller
  
```ruby  
...
def approve
  # updating post
  @post = Post.find(params[:id])
  ...
  respond_to do |format|
    if @post.update_attributes(params[:post])
      format_remote format, :update, @post
    else
      format_remote format, :edit, @post
    end
  end
end
... 
```


b. Aksi tidak memunculkan modal, tetapi langsung update. Dengan custom method, model yang diupdate BERBEDA dengan controller.
    rtc_controller_name & rtc_partial langsung ditambahkan pada link

View:
  tambahkan class html '.edit' pada button custom


```haml  
...
= link_to 'approve', approve_post_path(post, rtc_controller_name: 'posts', rtc_partial: 'users/post'), remote: :true, class: 'btn edit'
...
```

Controller

```ruby  
...
def approve
  # updating post
  @post = Post.find(params[:id])
  ...
  respond_to do |format|
    if @post.update_attributes(params[:post])
      format_remote format, :update, @post
    else
      format_remote format, :edit, @post
    end
  end
end
... 
```






- register mime xls
- create ability.rb
- define current_user in application_controller if not using devise, then set as helper_method
- define method is? in user.rb

- rtc_button_new hanya true, false



## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
