import mongoose from "mongoose";

const Schema = mongoose.Schema;

// user schema

/* username: String, required, unique
 * hash: String
 * salt: String
 * savedPosts: String array
 * profileCustomization: [String icon, String color]
 * darkMode: boolean
 * following: [_id, String username, profileCustomization schema]
 * followers: [_id, String username, profileCustomization schema]
 */
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        hash: String,
        salt: String,
        savedPosts: [String],
        profileCustomization: {
            type: [
                {
                    icon: {
                        type: String,
                        default: "user",
                    },
                    color: {
                        type: String,
                        default: "blue",
                    },
                },
            ],
            default: [{}], // Set a default object for the array
        },
        darkMode: { type: Boolean },
        following: [
            {
                _id: mongoose.Schema.Types.ObjectId,
                username: String,
                profileCustomization: {
                    type: [
                        {
                            icon: {
                                type: String,
                                default: "user",
                            },
                            color: {
                                type: String,
                                default: "blue",
                            },
                        },
                    ],
                    default: [{}], // Include profileCustomization for following
                },
            },
        ],
        followers: [
            {
                _id: mongoose.Schema.Types.ObjectId,
                username: String,
                profileCustomization: {
                    type: [
                        {
                            icon: {
                                type: String,
                                default: "user",
                            },
                            color: {
                                type: String,
                                default: "blue",
                            },
                        },
                    ],
                    default: [{}], // Include profileCustomization for following
                },
            },
        ],
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const User = mongoose.model("User", userSchema);

export default User;
