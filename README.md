# project
Project transfer and download file using node.js

# Requirements
DATABASE
* Tables:
- Bảng users :

Tên		Kiểu dữ liệu		Chi tiết
id		INT			Khóa của bảng.
email		VARCHAR			Email của người dùng.
password	VARCHAR			Mật khẩu của người dùng đã được hash.
fullname	VARCHAR			Tên đầy đủ của người dùng.
token		VARCHAR			Token của người dùng.
token_active	INT			Trạng thái của token người dùng,
					đã được sử dụng hay chưa được sử dụng.
block		INT			Mặc định sẽ có giá trị là 1,
					được dùng khi xóa người dùng thì sẽ set giá trị này là 0.
token_timeout	DATE			Thời gian tồn tại token của người dùng.
send_email	INT			Khi người dùng nhập sai mật khẩu quá số lần quy định
					thì sẽ gửi mail để xác nhận lại. Giá trị mặc định sẽ là 0,
					khi đã gửi mail cho người dùng thì nó sẽ thay đổi là 1.
created_at	TIMESTAMP		Thời gian tạo ra người dùng.
update_at	TIMESTAMP		Thời gian update thông tin người dùng.

- Bảng files :

Tên		Kiểu dữ liệu		Chi tiết
id		INT			Khóa của bảng.
name		VARCHAR			Tên của file.
format		VARCHAR			Kiểu định dạng file.
id_user		INT			Chứa ID của người sở hữu.
code		VARCHAR			Chứa mã file là tên file + thời gian upload file
					sử dụng đến micro giây.
size		FLOAT			Chứa dung lượng của file(Mb).
path		VARCHAR			Chứa đường dẫn chỉ đến file hiện hành chứa trên Server.
created_at	TIMESTAMP		Thời gian tạo gửi file.
update_at	TIMESTAMP		Thời gian update thông tin của file.


RESTful
- Signin :

+ GET:
	params :
		Không có.
	response :
		* Render ra trang login và cho người dùng đăng nhập.

+ POST:
	params :
		email : String
		password : String
	response :
		* Nếu chưa tồn tại người dùng :
			return { data: { error : “User not exist!!”}}
		* Nếu đã tồn tại người dùng, thì tiếp tục kiểm tra password.
			* Nếu password đúng : chuyển trang vào index.
			* Nếu password sai :
				return { data: { error : “Password wrong!!”} }

- Signup :

+ GET:
	params :
		Không có.
	response :
		* Render ra trang register và cho người dùng đăng kí thông tin.

+ POST:
	params :
		email : String
		password : String
		fullname : String.
	response :
		* Nếu chưa người dùng chưa nhập vào email :
			return { data: { error : “Email is required!!”} }
		* Nếu đã người dùng đã nhập email, thì tiếp tục kiểm tra password đã 		nhập chưa và có khớp không?
			* Nếu password chưa nhập :
				return { data : { error : “Please enter password!!”} }
			* Nếu password không khớp :
				return { data : { error : “Password not match!!”} }
			* Nếu password khớp : Thêm người dùng vào Database.
				* Nếu thêm thành công : chuyển sang trang signin để người 				dùng đăng nhập.
				* Nếu thêm chưa thành công:
					return { data : { error : “Could not insert data!!”} }

